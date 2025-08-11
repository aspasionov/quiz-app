'use client'
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import useSnackBarStore from '@/stores/useSnackBarStore';
import { MAIN_COLOR, SECOND_COLOR } from '@/constans';


export default function SnackBar() {
  const { message, severity, open, closeSnackbar } = useSnackBarStore();
  return (
    <Snackbar
      open={open}
      // sx={{
      //   '& .MuiPaper-root': {
      //     backgroundColor: SECOND_COLOR,
      //     color: MAIN_COLOR,
      //   }
      // }}
      // autoHideDuration={6000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={closeSnackbar}
    >
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  )
}