#include <ttydr/asm.h>
#include <ttydr/defs.h>

#define HEAP_START (PAYLOAD_RAM + PAYLOAD_SIZE + 0x10000)
#define HEAP_END   0x817c0000

/* The loader */
PATCH_START 0x80003154
  mflr  %r0
  stw   %r0,-4(%r1)
  addi  %r1,%r1,-0x10

  /* Call the default init func */
  lis   %r3,0x80070d18@ha
  addi  %r3,%r3,0x80070d18@l
  mtctr %r3
  bctrl

  /* Resume the DVD (?) */
  lis   %r6,DVDResume@ha
  addi  %r6,%r6,DVDResume@l
  mtlr  %r6
  blrl

  /* Read the payload from the disc */
  lis   %r3,PAYLOAD_RAM@ha
  addi  %r3,%r3,PAYLOAD_RAM@l

  lis   %r4,PAYLOAD_SIZE@ha
  addi  %r4,%r4,PAYLOAD_SIZE@l

  lis   %r5,PAYLOAD_ISO@ha
  addi  %r5,%r5,PAYLOAD_ISO@l

  lis   %r6,ReadDisc@ha
  addi  %r6,%r6,ReadDisc@l
  mtlr  %r6
  blrl

  /* Return */
  addi  %r1,%r1,0x10
  lwz   %r0,-4(%r1)
  mtlr  %r0
  blr
PATCH_END

/* Call the loader */
PATCH_START 0x800055f0
  bl (. - 0x800055f0 + 0x80003154)
PATCH_END

/* Fix the end of heap */
PATCH_START 0x80299308
  nop
  nop
  lis   %r3,HEAP_END@ha
  addi  %r3,%r3,HEAP_END@l
PATCH_END
