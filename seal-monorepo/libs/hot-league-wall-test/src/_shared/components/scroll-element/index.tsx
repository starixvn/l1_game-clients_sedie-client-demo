import React, { useState } from 'react';

interface WrapperProps {
    children: React.ReactNode;
    refData: React.RefObject<HTMLDivElement>;
}

const ScrollElement: React.FC<{ className: string } & WrapperProps> = ({ children, className, refData }) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [startX, setStartX] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useState<number>(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!refData.current) return;
        setIsDragging(true);
        setStartX(e.pageX - (refData.current?.offsetLeft || 0));
        setScrollLeft(refData.current?.scrollLeft || 0);
    };
    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !refData.current) return;
        e.preventDefault();
        const x = e.pageX - refData.current.offsetLeft;
        const walk = (x - startX) * 1; // Adjust scroll speed if necessary
        refData.current.scrollLeft = scrollLeft - walk;
    };

    return <div
        className={className}
        ref={refData}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
            cursor: isDragging ? 'grabbing' : 'grab',
        }}
    >
        {children}
    </div>;
};
export default ScrollElement;