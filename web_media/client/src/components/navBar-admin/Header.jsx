import React from 'react'
import "./header.scss"
import 
 {BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle, BsSearch, BsJustify}
 from 'react-icons/bs'

function Header({openSidebar}) {
  return (
    <header className='header'>
        <div className='menu-icon'>
            <BsJustify className='icon' onClick={openSidebar}/>
        </div>
        <div className='header-left'>
        </div>
        <div className='header-right'>
            <BsPersonCircle className='icon'/>
        </div>
    </header>
  )
}

export default Header