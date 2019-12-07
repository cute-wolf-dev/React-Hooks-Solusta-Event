import React, { useState, useEffect } from 'react';
import axios from 'axios';

// import @material-ui components
import { Button, Grid, Box } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';

// import assets
import BG1 from '../assets/images/bg-1.jpg';
import BG2 from '../assets/images/bg-2.jpg';
import BG3 from '../assets/images/bg-3.jpg';
import BG4 from '../assets/images/bg-4.jpg';
import BG5 from '../assets/images/bg-5.jpg';
import BG6 from '../assets/images/bg-6.jpg';
import BG7 from '../assets/images/bg-7.jpg';

// import env server link
const environment = require('../RegistrationEnv');
const SERVER_LINK = (environment.env === 'server') ? environment.ServerLink.prod : environment.ServerLink.env;

const styles = (theme) => ({

    paper: {
        position: 'absolute',
        margin: '0',
        padding: '0',
        background: 'red'
    },

    outerBox: {
        margin: '0',
        width: '100%',
        overflow: 'hidden'
    },
    modal_print: {
        position:'relative',
        display:'block',
        margin:'0',
        padding: '0',
        width: '100%',
        pageBreakerAfter: 'always'
    },
    photoContainer: {
        position: 'absolute',
        left: '194px',
        width: '110px',
        height: '150px',
        right: '0',
        top: '55px',
        overflow:'hidden'
    },

    backGround: {
        width: '100%',
        height: '100%'
    },

    photoImg: {
        width: '100%',
        margin:'0 auto'
    },
    friendly: {
        position: 'absolute',
        left: '174px',
        top: '210px',
        right: '0',
        fontSize: '18px',
        textAlign: 'center',
        color: '#4d4d4d'
    },
    nameStyle: {
        position: 'absolute',
        top: '57%',
        width:'100%',
        textAlign:'center',
        color: '#174883',
        textTransform:'uppercase'
    },

    companyNameStyle: {
        position: 'absolute',
        top: '64%',
        width:'100%',
        textAlign:'center',
        textTransform:'uppercase'
    },



});

const ImagePart = ({ item }) => {
    switch (item.attendeeCategorySAS[0].categoryName.toUpperCase()) {
        case "SPEAKER": {
            return (
                <img src={BG3} alt="background"/>
            );
        }
        case "ORGANIZER": {
            return (
                <img src={BG5} alt="background"/>
            );
        }
        case "PARTICIPANT": {
            return (
                <img src={BG1} alt="background"/>
            );
        }
        case "EVENT CREW" : {
            return (
                <img src={BG6} alt="background"/>
            );
        }
        case "MEDIA": {
            return (
                <img src={BG2} alt="background"/>
            );
        }
        case "SECURITY": {
            return (
                <img src={BG4} alt="background"/>
            );
        }
        case "CONTRACTOR": {
            return (
                <img src={BG7} alt="background"/>
            );
        }
        default: {
            return (
                <img src={BG7} alt="background"/>
            );
        }
    }
}

class PrintComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data : props.data,
            rows: props.rows,
            friendlyIdArr: [],
        };
    }

    componentDidMount() {
        this.getFriendlyIdArr();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if ((nextProps.data !== prevState.data) || (nextProps.rows !== prevState.rows)) {
            return {
                data: nextProps.data,
                rows: nextProps.rows,
            }
        } else {
            return null;
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.data !== this.state.data) {
            this.getFriendlyIdArr();
        }
    }

    getFriendlyIdArr = () => {
        const { data } = this.state;
        const promiseArr =  data.map((item, index) => {
            return this.getFriendlyId(item);
        });
        Promise.all(promiseArr).then(values => {
            let friendlyIdArr = [];
            values.map((item, index) => {
                friendlyIdArr.push({
                    fId: item,
                    id: data[index].id,
                });
            })
            this.setState({ friendlyIdArr: friendlyIdArr });
        });
    }

    getFriendlyId = (item) => {
        return new Promise((resolve, reject) => {
            const header = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`,
                }
            };
            const body = {
                key: 'value',
            };
            axios.get(`${SERVER_LINK}/api/badge-sas?attendeeSAId.equals=${item.id}`, body, header)
                .then((res) => {
                    console.log('here in friendlyID: ', res);
                    resolve((res.data && res.data.length > 0) ? res.data[0].badgeFriendlyID : 0);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

    render() {
        const { data, rows, friendlyIdArr } = this.state;
        const { classes } = this.props;
        console.log('here in print component: ', data);
        const displayData = data && data
                                .filter((item) => {
                                    return rows.some((row) => {
                                        return row.id === item.id;
                                    })
                                });

        return (
            <div className={classes.paper}>
                {displayData && displayData
                    .map((item, index) => {
                        const fId = friendlyIdArr.filter(fItem => fItem.id === item.id);
                        return (
                        <Box className={classes.outerBox} display="none" displayPrint="block" m={1} key={index.toString()}>
                            <div id="modal-print" className={classes.modal_print}>
                                <h1 className={classes.nameStyle}>{item.firstName + ' ' + item.lastName}</h1>
                                <h2 className={classes.companyNameStyle}>{item.companyName}</h2>
                                {(fId && fId[0]) && <h2 className={classes.friendly}>{fId[0].fId}</h2>}
                                <ImagePart item={item} />
                                <div className={classes.photoContainer}>
                                    <img className={classes.photoImg} src={`data:${item.mainPhotoContentType};base64, ${item.mainPhoto}`} alt="badge"/>
                                </div>
                            </div>
                        </Box>
                )})}
            </div>
        );
    }
}

const StyledPrintComponent = withStyles(styles)(PrintComponent);

export default StyledPrintComponent;
