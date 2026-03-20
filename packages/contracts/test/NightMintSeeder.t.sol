// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseTest} from "./helpers/BaseTest.sol";
import {INightMintSeeder} from "../src/interfaces/INightMintSeeder.sol";

contract NightMintSeederTest is BaseTest {
    function test_deterministicOutputForSameBlock() public view {
        INightMintSeeder.Seed memory seed1 = seeder.generateSeed(0, address(descriptor));
        INightMintSeeder.Seed memory seed2 = seeder.generateSeed(0, address(descriptor));

        assertEq(seed1.background, seed2.background);
        assertEq(seed1.shape, seed2.shape);
        assertEq(seed1.shapeColor, seed2.shapeColor);
        assertEq(seed1.accentShape, seed2.accentShape);
        assertEq(seed1.accentColor, seed2.accentColor);
    }

    function test_differentTokenIdsProduceDifferentSeeds() public view {
        INightMintSeeder.Seed memory seed0 = seeder.generateSeed(0, address(descriptor));
        INightMintSeeder.Seed memory seed1 = seeder.generateSeed(1, address(descriptor));

        // At least one trait should differ
        bool allSame = (seed0.background == seed1.background) && (seed0.shape == seed1.shape)
            && (seed0.shapeColor == seed1.shapeColor) && (seed0.accentShape == seed1.accentShape)
            && (seed0.accentColor == seed1.accentColor);

        assertFalse(allSame, "Different tokenIds should produce different seeds");
    }

    function test_traitIndicesWithinBounds() public view {
        for (uint256 i = 0; i < 10; i++) {
            INightMintSeeder.Seed memory seed = seeder.generateSeed(i, address(descriptor));

            assertLt(seed.background, descriptor.backgroundCount());
            assertLt(seed.shape, descriptor.shapeCount());
            assertLt(seed.shapeColor, descriptor.colorCount());
            assertLt(seed.accentShape, descriptor.shapeCount());
            assertLt(seed.accentColor, descriptor.colorCount());
        }
    }
}
