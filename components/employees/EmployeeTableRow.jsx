'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

import { Icon } from '@iconify/react';

// ─── EmployeeTableRow ─────────────────────────────────────────────────────────

export default function EmployeeTableRow({ row, selected, onSelectRow, onView, onEdit, onDelete }) {
  const [anchor, setAnchor] = useState(null);

  const handleView = useCallback(() => {
    setAnchor(null);
    onView(row);
  }, [onView, row]);

  const handleEdit = useCallback(() => {
    setAnchor(null);
    onEdit(row);
  }, [onEdit, row]);

  const handleDelete = useCallback(() => {
    setAnchor(null);
    onDelete(row);
  }, [onDelete, row]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        {/* Name + email */}
        <TableCell component="th" scope="row">
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.name} src={row.avatarUrl} />
            <Box>
              <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
              {row.email && (
                <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{row.email}</Box>
              )}
            </Box>
          </Box>
        </TableCell>

        {/* Department */}
        <TableCell>{row.company}</TableCell>

        {/* Designation */}
        <TableCell>{row.role}</TableCell>

        {/* Active check */}
        <TableCell align="center">
          {row.isVerified ? (
            <Icon icon="solar:check-circle-bold" width={22} color="#22C55E" />
          ) : (
            '-'
          )}
        </TableCell>

        {/* Status badge */}
        <TableCell>
          <Chip
            label={row.status}
            size="small"
            color={row.status === 'banned' ? 'error' : 'success'}
            variant="soft"
            sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              fontSize: 12,
            }}
          />
        </TableCell>

        {/* Actions menu */}
        <TableCell align="right">
          <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
            <Icon icon="eva:more-vertical-fill" width={20} />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Popover menu */}
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MenuItem
            onClick={handleView}
            sx={{ borderRadius: 0.75, gap: 2 }}
          >
            <Icon icon="solar:eye-bold" width={18} />
            View
          </MenuItem>
          <MenuItem
            onClick={handleEdit}
            sx={{ borderRadius: 0.75, gap: 2 }}
          >
            <Icon icon="solar:pen-bold" width={18} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{ borderRadius: 0.75, gap: 2, color: 'error.main' }}
          >
            <Icon icon="solar:trash-bin-trash-bold" width={18} />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
