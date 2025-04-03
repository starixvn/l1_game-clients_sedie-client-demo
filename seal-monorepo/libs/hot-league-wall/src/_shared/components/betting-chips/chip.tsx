import React from 'react';

interface ChipProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({ label, onClick, disabled = false }) => (
    <a 
        className='c-btn'
        aria-hidden='true'
        onClick={onClick}
        style={{ opacity: disabled ? 0.5 : 1 }}
    >
        <span className='c-text'>{label}</span>
    </a>
);
export default Chip;