import React from "react";
import { render, screen } from "@testing-library/react";
import { RoundDot } from "libs/saba-games/src/_shared/components/dot";
import "@testing-library/jest-dom";

// Mock SCSS module
jest.mock("libs/saba-games/src/_shared/components/dot/dot.module.scss", () => ({
    "dot-even": "dot-even",
    "dot-odd": "dot-odd",
    "highlight-current-result": "highlight-current-result",
    small: "small",
    medium: "medium",
    bigsmall: "bigsmall",
    baccarat: "baccarat",
}));

describe("RoundDot Component", () => {
    it("renders with default props", () => {
        render(<RoundDot />);
        const dot = screen.getByTestId("round-dot");

        expect(dot).toBeInTheDocument();
        expect(dot).toHaveClass("dot-even");
        expect(dot).not.toHaveClass("highlight-current-result");
        expect(dot).toBeEmptyDOMElement();
    });

    it("renders with value", () => {
        render(<RoundDot value={7} />);
        const dot = screen.getByTestId("round-dot");
        expect(dot).toHaveTextContent("7");
    });

    it("applies highlight class when highlight is true", () => {
        render(<RoundDot highlight />);
        const dot = screen.getByTestId("round-dot");
        expect(dot).toHaveClass("highlight-current-result");
    });

    it("applies size class when size is passed", () => {
        render(<RoundDot size="small" />);
        const dot = screen.getByTestId("round-dot");
        expect(dot).toHaveClass("small");
    });

    it("applies gameName class if provided", () => {
        render(<RoundDot gameName="baccarat" />);
        const dot = screen.getByTestId("round-dot");
        expect(dot).toHaveClass("baccarat");
    });

    it("applies additional custom classNameStyle", () => {
        render(<RoundDot classNameStyle="custom-class" />);
        const dot = screen.getByTestId("round-dot");
        expect(dot).toHaveClass("custom-class");
    });

    it("renders dot with custom choice (e.g., odd)", () => {
        render(<RoundDot choice="odd" />);
        const dot = screen.getByTestId("round-dot");
        expect(dot).toHaveClass("dot-odd");
    });
});
