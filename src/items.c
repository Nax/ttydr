#include <ttyd.h>
#include <ttydr/patch.h>

static Item* itemEntryHook(double x, double y, double z, char *resName, int itemId, u16 spawnVal1, s32 switchFlag, u32 spawnVal3)
{
    return itemEntry(x, y, z, resName, 0x72, spawnVal1, switchFlag, spawnVal3);
}

PATCH_CALL(0x800ab8b0, itemEntryHook);
