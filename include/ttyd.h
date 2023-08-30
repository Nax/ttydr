#ifndef TTYD_H
#define TTYD_H

#include <ttydr/types.h>

typedef struct Item Item;

#define SEQID_GAME_LOAD 0x03

Item* itemEntry(double x, double y, double z, char *resName, int itemId, u16 spawnVal1, s32 switchFlag, u32 spawnVal3);
void seqSetSeq(int seqId, const char* map, const char* seq);

#endif
