import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // only allows for POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { username, password } = req.body as { username: string; password: string };

    // must provide username + password (maybe make this admin only?)
    if (!username || !password) {
        return res.status(400).json({
            error: "Please provide all the required fields",
        });
    }

    try {
        // TODO: implement stocks table update
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Error! Could not update the stocks",
        });
    }
}