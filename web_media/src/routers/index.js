import Home from '../pages/Home';
import Watch from '../pages/Watch';
import Profile from '../pages/profile';

//Public routers
const publicRouters = [
    { path: '/', component: Home },
    { path: '/watch', component: Watch },
    { path: '/profile', component: Profile },
]

const privateRouters = []

export { publicRouters, privateRouters }