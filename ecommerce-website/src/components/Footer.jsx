import React from 'react';
import { Box, Typography, Container, Divider, Link, Stack } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' 
          ? theme.palette.grey[200] 
          : theme.palette.grey[800],
        position: 'relative',
        bottom: 0,
        width: '100%',
        zIndex: 1000
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography color="text.secondary" align="center">
            &copy; {new Date().getFullYear()} ShopEasy. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="#" color="inherit" underline="hover">Privacy Policy</Link>
            <Link href="#" color="inherit" underline="hover">Terms of Use</Link>
            <Link href="#" color="inherit" underline="hover">Contact</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;