import { HeaderOnly } from '../components/Layout';
import Home from '../pages/Home';
import Watch from '../pages/Watch';
import Profile from '../pages/profile';
import Group from '../pages/group';
import AllGroup from '../pages/allGroup';
import Upload from '../pages/Upload';
import Search from '../pages/Search';
import Chat from '../pages/Chat';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';

//Public routers
const publicRouters = [
    { path: '/', component: Login, layout: null },
    { path: '/home', component: Home},
    { path: '/watch', component: Watch },
    { path: '/profile', component: Profile },
    { path: '/search', component: Search, layout: null },
    { path: '/chat', component: Chat },
    { path: '/upload', component: Upload, layout: HeaderOnly },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/group/all', component: AllGroup},
    { path: '/group', component: Group},

]

const privateRouters = []

export { publicRouters, privateRouters }