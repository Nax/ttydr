#ifndef STDDEF_H
#define STDDEF_H

#define NULL ((void *)0)
#define offsetof(type, member) ((size_t)(&((type *)0)->member))

typedef unsigned long size_t;
typedef long ptrdiff_t;

#endif
