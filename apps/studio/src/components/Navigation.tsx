import { NavLink } from 'react-router-dom';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

const navItems = [
  { path: '/cjm', label: 'CJM', Icon: MapOutlinedIcon },
  { path: '/sbp', label: 'SBP', Icon: AccountTreeOutlinedIcon },
  { path: '/outcome', label: 'Outcome', Icon: TrackChangesOutlinedIcon },
  { path: '/em', label: 'EM', Icon: MenuBookOutlinedIcon },
];

export function Navigation() {
  return (
    <Box
      component="nav"
      sx={{
        width: 80,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 2,
      }}
    >
      <Stack spacing={1} alignItems="center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <ButtonBase
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  flexDirection: 'column',
                  gap: 0.5,
                  bgcolor: isActive ? 'primary.lighter' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.lighter' : 'action.hover',
                  },
                }}
              >
                <item.Icon />
                <Typography variant="caption" fontWeight="medium">
                  {item.label}
                </Typography>
              </ButtonBase>
            )}
          </NavLink>
        ))}
      </Stack>
    </Box>
  );
}
