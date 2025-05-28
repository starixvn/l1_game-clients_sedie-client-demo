import React from "react";
import { render, screen } from "@testing-library/react";
import Dice from "libs/saba-games/src/_shared/components/dice";
import { Size } from "libs/saba-games/src/_shared/constants";
import "@testing-library/jest-dom";

// Mock SCSS module
jest.mock("libs/saba-games/src/_shared/components/dice/dice.module.scss", () => ({
    "dice-large": "dice-large",
    "dice-medium": "dice-medium",
    "dice-small": "dice-small",
}));

// Mock dice images
jest.mock("../../../../src/assets/big-small/dice-1.png", () => "dice-1.png");
jest.mock("../../../../src/assets/big-small/dice-2.png", () => "dice-2.png");
jest.mock("../../../../src/assets/big-small/dice-3.png", () => "dice-3.png");
jest.mock("../../../../src/assets/big-small/dice-4.png", () => "dice-4.png");
jest.mock("../../../../src/assets/big-small/dice-5.png", () => "dice-5.png");
jest.mock("../../../../src/assets/big-small/dice-6.png", () => "dice-6.png");
jest.mock("../../../../src/assets/big-small/dice-question-mark.png", () => "dice-question-mark.png");

describe("Dice Component", () => {
    it("renders the correct dice image based on dice number", () => {
        const testCases = [
            { number: 1, expectedSrc: "dice-1.png" },
            { number: 2, expectedSrc: "dice-2.png" },
            { number: 3, expectedSrc: "dice-3.png" },
            { number: 4, expectedSrc: "dice-4.png" },
            { number: 5, expectedSrc: "dice-5.png" },
            { number: 6, expectedSrc: "dice-6.png" },
            { number: 0, expectedSrc: "dice-question-mark.png" },
        ];

        testCases.forEach(({ number, expectedSrc }) => {
            const { unmount } = render(<Dice diceNumber={number} />);
            const img = screen.getByAltText(`dice-${number || "unknown"}`);
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute("src", expectedSrc);
            unmount();
        });
    });

    it("applies correct class based on size", () => {
        const sizes = [
            { size: Size.large, className: "dice-large" },
            { size: Size.medium, className: "dice-medium" },
            { size: Size.small, className: "dice-small" },
        ];

        sizes.forEach(({ size, className }) => {
            const { unmount } = render(<Dice diceNumber={3} size={size} />);
            const img = screen.getByAltText("dice-3");
            expect(img).toHaveClass(className);
            unmount();
        });
    });

    it("defaults to large size if no size is provided", () => {
        render(<Dice diceNumber={4} />);
        const img = screen.getByAltText("dice-4");
        expect(img).toHaveClass("dice-large");
    });
});
