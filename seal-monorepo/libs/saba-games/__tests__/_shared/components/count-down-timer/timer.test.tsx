import React from "react";
import { render } from "@testing-library/react";
import Timer from "libs/saba-games/src/_shared/components/count-down-timer/timer";
import "@testing-library/jest-dom";

describe("Timer component", () => {
    it("should render correctly", () => {
        const { container } = render(<Timer className="test-class" />);
        expect(container).toBeInTheDocument();
    });

    it("should render an SVG element", () => {
        const { container } = render(<Timer className="custom-class" />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass("custom-class");
    });

    it("should contain a <path> inside the SVG", () => {
        const { container } = render(<Timer className="custom-class" />);
        const path = container.querySelector("svg path");
        expect(path).toBeInTheDocument();
        expect(path?.getAttribute("d")).toContain("M0,12.5"); // Basic start check
    });

    it("should apply the provided className", () => {
        const customClass = "test-class";
        const { container } = render(<Timer className={customClass} />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveClass(customClass);
    });

    it("should have the correct viewBox", () => {
        const { container } = render(<Timer className="custom-class" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("viewBox", "-0.0000124083 0 19 22.02");
    });

    it("should have xmlns set for SVG namespace", () => {
        const { container } = render(<Timer className="custom-class" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
    });
});
