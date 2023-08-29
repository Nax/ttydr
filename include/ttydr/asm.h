#ifndef TTYDR_ASM_H
#define TTYDR_ASM_H

.macro PATCH_START addr
.section .patch, "awx"
.int 0x1
.int \addr
.int (1f - 0f)
0:
.endm

.macro PATCH_END
1:
.balign 8
.previous
.endm

#endif
