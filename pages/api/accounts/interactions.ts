// THIS ENDPOINT TO BE USED BY LOGGED IN USERS TO EDIT/RETRIEVE THEIR Interactions
// CAN BE USED BY USERS AND ADMINS
// EXAMPLE OF A LOGGED IN PROTECTED PATH

import prisma from "@/utils/db";
import { verifyToken, attemptRefreshAccess, verifyTokenLocal} from "@/utils/auth";
// import { verifyFirstname, verifyLastname, verifyPassword, verifyPhonenumber, verifyUsername } from "@/utils/verification";
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // api middleware (USE THIS TO REFRESH/GET THE TOKEN DATA)
    // ======== TOKEN HANDLING STARTS HERE ==========
    const { x_refreshToken } = req.headers;
    let payload = null
    try {
        // attempt to verify the provided access token!!
        payload = verifyToken(req.headers.authorization);
    } catch (err) {
        // this happens if we can't succesfully verify the access token!!
        try {
            // attempt to refresh access token using refresh token
            console.log(err)
            let new_accessToken
            if (x_refreshToken) {
                new_accessToken = attemptRefreshAccess(x_refreshToken);
            } else {
                // no Refresh token, so we have Token Error
                return res.status(401).json({
                    error: "Token Error",
                });
            }
            if (!new_accessToken) {
                // new access token not generated!
                return res.status(401).json({
                    error: "Token Error",
                });
            }
            // set the payload to be correct using new access token
            payload = verifyTokenLocal(new_accessToken)

            if (!payload) {
                // new access token not generated!
                return res.status(401).json({
                    error: "Token Error",
                });
            }
        } catch (err) {
            // refresh token went wrong somewhere, push token error
            console.log(err)
            return res.status(401).json({
                error: "Token Error",
            });
        }
    }
    if (!payload) {
        // access token verification failed
        try {
            // attempt to refresh access token with refresh token
            let new_accessToken
            if (x_refreshToken) {
                new_accessToken = attemptRefreshAccess(x_refreshToken);
            } else {
                // no Refresh token, so we have Token Error
                return res.status(401).json({
                    error: "Token Error",
                });
            }
            if (!new_accessToken) {
                // new access token not generated!
                return res.status(401).json({
                    error: "Token Error",
                });
            }
            // set the payload to be correct using new access token
            payload = verifyTokenLocal(new_accessToken)

            if (!payload) {
                // new access token not generated!
                return res.status(401).json({
                    error: "Token Error",
                });
            }
        } catch (err) {
            console.log(err)
            return res.status(401).json({
                error: "Token Error",
            });
        }
    }

    // if we get here, assume that payload is correct!
    // ========== TOKEN HANDLING ENDS HERE ==========

    // actual api starts
    if (req.method === "GET") {
        // Retrieve the interactions of the currently logged in user
        try {

            const user = await prisma.user.findUnique({
                where: {
                    username: payload.username,
                }, select: {
                    interactions: true,
                    deleted: true,
                },
            })
            if (!user) {
                return res.status(200).json({
                    message: "Requested user could not be found",
                });
            }

            if (user.deleted) {
                return res.status(401).json({
                    error: "User has been deleted! Please contact Support!",
                });
            }
            // add the total number of interactions to the user object
            const numberOfInteractions = user.interactions.length;

            // returns the interactions of the user in the format:
            // {
            //     interactions: [
            //         {
            //             id: 1,
            //             userId: 1,
            //             type: "text",
            //             question: "This image is a ...",
            //             imageUrl: NULL,
            //             timestamp: "2023-10-01T00:00:00.000Z",
            //         }, 
            
            //         {
            //             id: 2,
            //             userId: 1,
            //             type: "image",
            //             question: "What is this image?",
            //             imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
            //             timestamp: "2023-10-01T00:00:00.000Z",
            //         },
            //     ],
            //     numberOfInteractions: 2,
            //     deleted: false,
            // }

            res.status(200).json({ interactions: user.interactions, numberOfInteractions: numberOfInteractions, deleted: user.deleted });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "ERROR RETRIEVING INTERACTION HISTORY. PLEASE TRY AGAIN OR CONTACT SUPPORT!",
            });
        }


    } 
    else if (req.method === "PUT") {
        // add a new interaction to the user
        // only logged in users can add interactions to their OWN account
        const { type, question, imageUrl} = req.body;
        try {
            // Mofify the account to have the provided info

            // verify all inputs
            // TODO: add verification for all inputs

            const user = await prisma.user.findUnique({
                where: {
                    username: payload.username,
                }, select: {
                    interactions: true,
                    deleted: true,
                    id: true,
                },
            })

            if (!user) {
                return res.status(400).json({
                    error: "Requested user could not be found",
                });
            }

            if (user.deleted) {
                return res.status(401).json({
                    error: "User has been deleted! Please contact Support!",
                });
            }
            
            // update the current user by adding the new interaction
            const added_interaction = await prisma.interaction.create({
                data: {
                    userId: user.id,
                    type: type,
                    question: question,
                    imageUrl: imageUrl,
                    timestamp: new Date(),
                },
                select: {
                    id: true,
                    userId: true,
                    type: true,
                    question: true,
                    imageUrl: true,
                    timestamp: true,
                },
            });
            // return the added interaction
            // return in format:
            // {
            //     id: 1,
            //     userId: 1,
            //     type: "text",
            //     question: "This image is a ...",
            //     imageUrl: NULL,
            //     timestamp: "2023-10-01T00:00:00.000Z",
            // }
            return res.status(201).json({ added_interaction: added_interaction });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "ERROR ADDING INTERACTION. PLEASE TRY AGAIN OR CONTACT SUPPORT!",
            });
        }
    } else if (req.method === "DELETE") {
        // only delete their own account
        try {

            const user = await prisma.user.findUnique({
                where: {
                    username: payload.username,
                },
            })
            if (!user) {
                return res.status(400).json({
                    message: "Requested user could not be found! This is not expected, please contact support!",
                });
            }

            if (user.deleted) {
                return res.status(200).json({
                    error: "User has already been deleted! Please contact Support!",
                });
            }

            // await prisma.user.delete({
            //     where: {
            //         username: username,
            //     },
            // });

            // delete all interactions of the user
            await prisma.interaction.deleteMany({
                where: {
                    userId: user.id,
                },
            });
            // console.log("User deleted: ", updated_user.username)
            return res.status(200).json({ message: "Interactions History deleted successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Error deleting Interaction History! Please try again!",
            });
        }
    }
    // placeholder return
    res.status(405).json({ error: "Method not allowed" });
}