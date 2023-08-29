#ifndef TTYDR_PATCH_H
#define TTYDR_PATCH_H

#include <ttydr/types.h>

#define CONCAT2(a, b) a ## b
#define CONCAT(a, b) CONCAT2(a, b)
#define PATCH_CALL(dst, src)    __attribute__((section(".patch"), used, aligned(8))) static u32 CONCAT(kPatch, __COUNTER__)[] = { 0x2, (u32)dst, (u32)src };

#endif
