import "./sideBar.scss"
import {
    BsGlobeAsiaAustralia, BsGrid1X2Fill, BsFillArchiveFill, BsFilePostFill, BsPeopleFill,
    BsListCheck, BsMenuButtonWideFill, BsFillGearFill
} from 'react-icons/bs'

const SideBar = ({ openSidebarToggle, openSidebar }) => {
    return (
        <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
            <div className='sidebar-title'>
                <div className='sidebar-brand'>
                    <BsGlobeAsiaAustralia className='icon_header' /> SOCIALMEDIA
                </div>
                <span className='icon close_icon' onClick={openSidebar}>X</span>
            </div>

            <ul className='sidebar-list'>
                <li className='sidebar-list-item'>
                    <a href="/admin">
                        <BsGrid1X2Fill className='icon' /> DASHBOARD
                    </a>
                </li>
                <li className='sidebar-list-item'>
                    <a href="/admin/posts">
                        <BsFilePostFill className='icon' /> Bài viết
                    </a>
                </li>
                <li className='sidebar-list-item'>
                    <a href="/admin/users">
                        <BsPeopleFill className='icon' /> Tài khoản
                    </a>
                </li>
            </ul>
        </aside>

    )
}

export default SideBar;