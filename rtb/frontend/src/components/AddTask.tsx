// This is the AddTask button at the bottom of the board
import { Box, Button, Theme, SxProps } from "@mui/material";


// Define the arguments that can be passed to an "AddTask" component
interface AddTaskProps {
  // children is the content rendered inside the box
  children: React.ReactNode;   
  
  // sx is the 
  sx?: SxProps<Theme>

  // onClick is a function that receives clicks
  // and does things with them. The default click function
  // is void, meaning that it will not do anything.
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}


function AddTask({ children, onClick, sx, ...props }: AddTaskProps) {
  return (
    <Button 
      onClick={onClick}
      component={Box} 
      sx={{
        p: 2,                 
        textAlign: 'left',
        border: '1px solid #ccc',
        borderRadius: 1,
        bgcolor: '#f5f5f5',
        width: "100%",
        cursor: 'pointer', 
        justifyContent: 'flex-start',
        '&:hover': {
          bgcolor: '#e0e0e0', 
          borderColor: '#999',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      }}
      {...props}
    >
      {children} 
    </Button>
  );
}

export default AddTask;