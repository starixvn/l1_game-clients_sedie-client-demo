import Styles from './title.module.scss';

export interface ITitleProps {
    title: string;
}

export const Title = (props: ITitleProps) => {
    const { title } = props;

    return(
            <div className={Styles['title']}>
                <div className={Styles['title-text']}>{title}</div>
                <div className={Styles['title-icon']} />
            </div>
    )
}
