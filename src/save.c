#include <stddef.h>
#include <ttyd.h>
#include <ttydr/patch.h>

static void newSave(void)
{
    /* Progress 20 = right after tutorial */
    swByteSet(0, 20);
    seqSetSeq(SEQID_GAME_LOAD, "gor_01", NULL);
}

PATCH_CALL(0x800f4d54, newSave);
PATCH_CALL(0x800f7264, newSave);
PATCH_CALL(0x800f723c, newSave);
