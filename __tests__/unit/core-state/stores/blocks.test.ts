import { Blocks, Interfaces, Managers } from "@arkecosystem/crypto";
import { BlockStore } from "../../../../packages/core-state/src/stores/blocks";
import { genesisBlock as GB } from "../../../utils/config/testnet/genesisBlock";

Managers.configManager.setFromPreset("testnet");

describe("BlockStore", () => {
    it("should push and get a block", () => {
        const genesisBlock: Interfaces.IBlock = Blocks.BlockFactory.fromData(GB);

        const store = new BlockStore(100);
        store.set(genesisBlock);

        expect(store.count()).toBe(1);
        expect(store.get(genesisBlock.data.id)).toEqual(genesisBlock.data);
        expect(store.get(genesisBlock.data.height)).toEqual(genesisBlock.data);
    });

    it("should fail to push a block if its height is not 1 and there is no last block", () => {
        const store = new BlockStore(2);

        expect(() => store.set({ data: { height: 3 } } as Interfaces.IBlock)).toThrow();
    });

    it("should fail to push a block if it isn't chained", () => {
        const store = new BlockStore(2);
        store.set({ data: { height: 1 } } as Interfaces.IBlock);

        expect(() => store.set({ data: { height: 3 } } as Interfaces.IBlock)).toThrow();
    });

    it("should return all ids and heights in the order they were inserted", () => {
        const store = new BlockStore(4);

        for (let i = 1; i < 5; i++) {
            store.set({ data: { id: i.toString(), height: i } } as Interfaces.IBlock);
        }

        expect(store.count()).toBe(4);
        expect(store.getIds()).toEqual(["1", "2", "3", "4"]);
        expect(store.getHeights()).toEqual([1, 2, 3, 4]);
    });
});
