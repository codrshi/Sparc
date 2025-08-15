import { Alert, Box } from "@mui/material";
import { useEffect } from "react";

function CustomAlert(props) {
    useEffect(() => {
        if (props.alertLabel === null) return;

        const timer = setTimeout(() => {
            props.setAlertLabel(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [props]);

    if (props.alertLabel === null)
        return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: `1rem`,
                right: '1rem',
                zIndex: 1000,
                width: 'auto'
            }}>
            <Alert
                variant="outlined"
                severity={props.alertLabel.severity}
                onClose={() => props.setAlertLabel(null)}>
                {props.alertLabel.text}
            </Alert>
        </Box>
    );
}

export default CustomAlert;