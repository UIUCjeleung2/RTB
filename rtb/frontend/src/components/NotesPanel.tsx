import * as React from 'react';
import { Box, TextField, Typography, Paper, Link, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

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
  const [isEditing, setIsEditing] = React.useState(false);

  // Function to detect and linkify URLs in text
  const linkifyText = (text: string) => {
    if (!text) return null;

    // Regex to match URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Check if this part is a URL
      if (part.match(urlRegex)) {
        const href = part.startsWith('www.') ? `http://${part}` : part;
        return (
          <Link
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: '#1976d2', wordBreak: 'break-all' }}
          >
            {part}
          </Link>
        );
      }

      // Regular text - preserve line breaks
      return part.split('\n').map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

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
      {/* Header with task title and edit button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {selectedTask.title}
        </Typography>
        {isEditing ? (
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setIsEditing(false)}
            sx={{ textTransform: 'none' }}
          >
            Done
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            sx={{ textTransform: 'none' }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
        Notes
      </Typography>

      {isEditing ? (
        <TextField
          multiline
          fullWidth
          value={localNotes}
          onChange={handleNotesChange}
          placeholder="Add notes for this task... (URLs will be automatically clickable)"
          variant="outlined"
          autoFocus
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
      ) : (
        <Box
          sx={{
            flex: 1,
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'auto',
            backgroundColor: '#fafafa',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {localNotes ? (
            <Typography variant="body2" component="div">
              {linkifyText(localNotes)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No notes yet. Click "Edit" to add notes.
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
