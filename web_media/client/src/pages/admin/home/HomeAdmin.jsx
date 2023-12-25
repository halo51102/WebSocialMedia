import React, { useContext, useEffect, useState } from 'react'
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill }
    from 'react-icons/bs'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line }
    from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../../axios';
import { AuthContext } from '../../../context/authContext';
import "./homeAdmin.scss"

function HomeAdmin({ socket }) {
    const [posts, setPosts] = useState(null);
    const [users, setUsers] = useState(null);
    const [numOfOnlineUsers, setNumOfOnlineUsers] = useState(0);
    const { currentUser } = useContext(AuthContext)

    useEffect(() => {
        socket?.on("getUsers", (data) => {
            const newData = data?.filter(user => user.userId !== currentUser.id && user.userId !== null);
            setNumOfOnlineUsers(newData?.length);
            console.log(newData)
        })
    }, [socket])

    const { data: countPosts } = useQuery(["countPosts"], () =>
        makeRequest.get("/posts/count").then((res) => {
            return res.data;
        })
    );

    const { data: countUsers } = useQuery(["countUsers"], () =>
        makeRequest.get("/users/count").then((res) => {
            return res.data;
        })
    );

    useEffect(() => {
        setPosts(countPosts)
        setUsers(countUsers)
    })

    const data = [
        {
            name: 'Page A',
            uv: 4000,
            pv: 2400,
            amt: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
            amt: 2210,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
            amt: 2290,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
            amt: 2000,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
            amt: 2181,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
            amt: 2500,
        },
        {
            name: 'Page G',
            uv: 3490,
            pv: 4300,
            amt: 2100,
        },
    ];

    return (
        <main className='main-container'>
            <div className='main-title'>
                <h3>DASHBOARD</h3>
            </div>

            <div className='main-cards'>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Bài viết</h3>
                    </div>
                    <h1>{posts}</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Tài khoản</h3>
                    </div>
                    <h1>{users}</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>Lượt truy cập</h3>
                    </div>
                    <h1>{numOfOnlineUsers}</h1>
                </div>
            </div>
        </main>
    )
}

export default HomeAdmin