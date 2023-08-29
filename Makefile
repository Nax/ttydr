# Configurable
DEBUG ?= 0

ARCH := powerpc-eabi

CFLAGS 		:= -ffreestanding -nostdlib -fno-PIC \
			   -Os -Wall -Werror=implicit-function-declaration -Werror=implicit-int -Wimplicit-fallthrough \
			   -Iinclude \
			   -MMD -MP
CC 			:= $(ARCH)-gcc
OBJCOPY 	:= $(ARCH)-objcopy
NM 			:= $(ARCH)-nm
BUILD_DIR 	:= build
SRC_DIR 	:= src

# Debug/Release
ifeq ($(DEBUG), 0)
BUILD_DIR 	:= $(BUILD_DIR)/Release
else
BUILD_DIR 	:= $(BUILD_DIR)/Debug
CFLAGS 		+= -DDEBUG=1
endif

TARGET_ELF		:= $(BUILD_DIR)/ttydr.elf
TARGET_PAYLOAD	:= $(BUILD_DIR)/ttydr_payload.bin
TARGET_PATCH	:= $(BUILD_DIR)/ttydr_patch.bin
SRC				:= $(shell find $(SRC_DIR) -name '*.c' -o -name '*.S')
OBJ				:= $(SRC:$(SRC_DIR)/%=$(BUILD_DIR)/obj/%.o)
LDSCRIPT_IN		:= $(SRC_DIR)/ttydr.ld.in
LDSCRIPT 		:= $(BUILD_DIR)/ld/ttydr.ld

.PHONY: all
all: $(TARGET_PAYLOAD) $(TARGET_PATCH)

-include $(shell find $(BUILD_DIR) -name '*.d' 2>/dev/null)

$(TARGET_PAYLOAD): $(TARGET_ELF)
	@mkdir -p $(dir $@)
	$(OBJCOPY) --only-section=.text -O binary $< $@

$(TARGET_PATCH): $(TARGET_ELF)
	@mkdir -p $(dir $@)
	$(OBJCOPY) --only-section=.patch -O binary $< $@

$(TARGET_ELF): $(OBJ) $(LDSCRIPT)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $(OBJ) -T $(LDSCRIPT) -o $@

$(BUILD_DIR)/obj/%.S.o: $(SRC_DIR)/%.S
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c -o $@ $<

$(BUILD_DIR)/obj/%.c.o: $(SRC_DIR)/%.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c -o $@ $<

$(LDSCRIPT): $(LDSCRIPT_IN)
	@mkdir -p $(dir $@)
	$(CC) -Iinclude -E -P -x c -MMD -MT $@ $< -o $@

.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)/obj $(BUILD_DIR)/ld
