import classNames from 'classnames/bind';
import styles from './Header.module.scss';

const cx= classNames.bind(styles)   // giúp bind object styles vào, trả function cx

function Header() {
    return <header className={cx('wrapper')}> 
        <div className={cx('inner')}>
            
        </div>
    </header>;
}

export default Header;