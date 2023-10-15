import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faHouseUser } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles)   // giúp bind object styles vào, trả function cx, thay vì 

function Header() {
    return <header className={cx('wrapper')}>
        <div className={cx('inner')}>
            <div className={cx('logo')}>
                <FontAwesomeIcon className={cx('logo-img')} icon={faHouseUser} />
                <h1 className={cx('logo-name')}>SocialMedia</h1>
            </div>
            <div className={cx('search')}>
                <input placeholder='Bạn muốn tìm ...' spellCheck='false' />
                <button type="" className={cx('search-btn')}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            </div>
            <div className={cx('actions')}>
                <button type="">

                </button>
            </div>
        </div>
    </header>;
}

export default Header;