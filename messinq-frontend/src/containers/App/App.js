import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import SendIcon from '@material-ui/icons/Send';

import NavigationContainer from "../NavigationContainer";

const menuItems = [
    { title: "Contacts", icon: ImportContactsIcon },
    { title: "Profile", icon: AccountCircleIcon },
];

const menuItemFactory = ({ title, icon: Icon }) => (
    <ListItem button key={ title }>
        <ListItemIcon><Icon /></ListItemIcon>
        <ListItemText primary={ title } />
    </ListItem>
);

const useStyles = makeStyles(theme => ({
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export default function App() {
    const classes = useStyles();

    return (
        <NavigationContainer menuItems={ menuItems } menuItemFactory={ menuItemFactory }>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <Typography paragraph>
                   <h1>SNE-Tech</h1>
                </Typography>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-end"
                >
                <Grid item xs={10}>
                    <form className={classes.container} noValidate autoComplete="off">
                    <TextField
                        id="filled-bare"
                        className={classes.textField}
                        placeholder="Say something!"
                        margin="normal"
                        variant="filled"
                        inputProps={{ 'aria-label': 'bare' }}
                    />
                </form>
                </Grid>
                    <Grid item xs={1}>
                    <IconButton><SendIcon /></IconButton>
                    </Grid>
                </Grid>
            </main>
        </NavigationContainer>
    );
};
