import Styles from './reconnecting.module.scss';

export const Loading: React.FC = () => {
    return (
        <div className={Styles['reconnecting-container']}>
            <div className={Styles['dot-elastic']}></div>
        </div>
    );
};

export default Loading;
