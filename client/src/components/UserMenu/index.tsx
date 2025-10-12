'use client';
import React from 'react';

import { useRouter } from 'next/navigation';

import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

import { authApi } from '@/utils/api';

import useUserStore from '@/stores/useUserStore';

function UserMenu() {
  
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const router = useRouter();
  const { user, clearUser } = useUserStore();

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleLogout = async () => {
    try {
      // Call the server logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if server call fails
    } finally {
      // Always perform client-side cleanup
      clearUser();
      // Clear auth cache
      const { authManager } = await import('@/utils/authManager');
      authManager.clearAuthCache();
      router.push('/login');
      handleCloseUserMenu();
    }
  };

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  return (
    <>
      <Tooltip title={`${user.name} (${user.email})`}>
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar 
            alt={user.name} 
            src={user.avatar || undefined}
            sx={{ bgcolor: user.avatar ? 'transparent' : 'secondary.main', color: 'primary.main', borderWidth: 1, borderStyle: 'solid', borderColor: 'secondary.main' }}
          >
            {!user.avatar && user.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px', minWidth: '200px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserMenu;