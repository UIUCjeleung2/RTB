import * as React from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';

interface NotesPanelProps {
  selectedTask: {
    _id: string;
    title: string;
    notes?: string;
  } | null;
  onNotesChange: (taskId: string, newNotes: string) => void;
}

export default function NotesPanel({ selectedTask, onNotesChange }: NotesPanelProps) {
  const [localNotes, setLocalNotes] = React.useState('');
  const [saveTimeout, setSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);

  // Update local notes when selected task changes
  React.useEffect(() => {
    if (selectedTask) {
      setLocalNotes(selectedTask.notes || '');
    } else {
      setLocalNotes('');
    }
  }, [selectedTask]);

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = event.target.value;
    setLocalNotes(newNotes);

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save (500ms after user stops typing)
    if (selectedTask) {
      const timeout = setTimeout(() => {
        onNotesChange(selectedTask._id, newNotes);
      }, 500);
      setSaveTimeout(timeout);
    }
  };

  if (!selectedTask) {
    return (
      <Paper
        sx={{
          width: { xs: '100%', md: '45%' },
          minWidth: { xs: '300px', md: '400px' },
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Click the notes icon on a task to view and edit notes
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        width: { xs: '100%', md: '45%' },
        minWidth: { xs: '300px', md: '400px' },
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {selectedTask.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Task Notes
      </Typography>
      <TextField
        multiline
        fullWidth
        value={localNotes}
        onChange={handleNotesChange}
        placeholder="Add notes for this task..."
        variant="outlined"
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            height: '100%',
            alignItems: 'flex-start',
          },
          '& .MuiInputBase-input': {
            height: '100% !important',
            overflow: 'auto !important',
          },
        }}
      />
    </Paper>
  );
}
