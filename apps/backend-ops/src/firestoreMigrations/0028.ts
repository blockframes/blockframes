import { Firestore } from "../admin";
import { PublicUser } from "@blockframes/user/types";
import { createHostedMedia } from "@blockframes/media/+state/media.model";

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore) {
    
    try {
        await db
            .collection('users')
            .get()
            .then(async users => updateUsers(users));
    } catch (error) {
        console.log(`An error happened while updating users: ${error.message}`);
    }

}

async function updateUsers(
    users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
    return Promise.all(
        users.docs.map(async doc => {
            const updatedUser = await updateUserWatermark(doc.data() as PublicUser);
            await doc.ref.set(updatedUser);
        })
    )
}

async function updateUserWatermark(
    user: PublicUser
) {
    user.watermark = createHostedMedia({
        ref: user.watermark['ref'],
        url: user.watermark['urls']['original']
    });
    return user;
}
