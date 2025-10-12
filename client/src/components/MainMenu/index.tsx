
'use client'
import React from 'react'

import Menu from './components/Menu'
import MenuMobile from './components/MenuMobile'
function MainMenu() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

return (
  <>
  <MenuMobile anchorElNav={anchorElNav} setAnchorElNav={setAnchorElNav} /> 
  <Menu setAnchorElNav={setAnchorElNav}/>
  </>
)
}

export default MainMenu