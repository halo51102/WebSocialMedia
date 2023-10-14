import { HeaderOnly } from '../components/Layout';
import Home from '../pages/Home';
import Watch from '../pages/Watch';
import Profile from '../pages/profile';
import Upload from '../pages/Upload';
import Search from '../pages/Search';
import Chat from '../pages/Chat';

//Public routers
const publicRouters = [
    { path: '/', component: Home },
    { path: '/watch', component: Watch },
    { path: '/profile', component: Profile },
    { path: '/search', component: Search, layout: null },
    { path: '/chat', component: Chat },
    { path: '/upload', component: Upload, layout: HeaderOnly },

]

const privateRouters = []

export { publicRouters, privateRouters }