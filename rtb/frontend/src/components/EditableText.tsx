import {TextField, ClickAwayListener, Typography} from "@mui/material";
import * as React from "react";


interface EditableTextProps {
    title: string;
    onTitleChange: (newTitle: string) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
}


export default function EditableText({title, onTitleChange, isEditing, setIsEditing} : EditableTextProps) {
  const [currentTitle, setCurrentTitle] = React.useState(title);

  /*React.useEffect(()=> {
    console.log(isEditing);
  }, [isEditing]);*/

  return (
    <>
    {isEditing ? (
    <ClickAwayListener onClickAway={() => {setIsEditing(false); onTitleChange(currentTitle);}}>
    <TextField value = {currentTitle}
               onChange={(e) => setCurrentTitle(e.target.value)}
               onKeyDown={(e) => {
                    if (e.key == "Enter") {
                        setIsEditing(false);
                        onTitleChange(currentTitle);
                    }
               }}
               size="small"
               autoFocus
               fullWidth    
    /> 
    </ClickAwayListener>
    ) : (
        <Typography variant="h6" sx={{ p: 1 }}>
            {currentTitle}
        </Typography>
    )
    }
    </>

  )
}
