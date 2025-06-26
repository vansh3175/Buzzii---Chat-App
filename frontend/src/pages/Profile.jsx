import { useDispatch, useSelector } from "react-redux";
import { Camera } from "lucide-react";
import axios from "axios";
import { setProfile } from "../store/authSlice";

export default function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();

    const uploadPhoto = (file) => {
        const data = new FormData();
        data.append("img", file);
        axios.post('http://localhost:5000/user/updateProfilePic', data, { withCredentials: true })
            .then((res) => {
                dispatch(setProfile({ userData: res.data.result }));
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const formattedDate = userData?.createdAt
        ? new Date(userData.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";

    return (
        <div className="flex items-center justify-center h-[calc(100vh-5rem)] bg-base-200 px-4">
            <div className="bg-base-100 shadow-xl rounded-3xl p-8 w-full max-w-5xl flex flex-col sm:flex-row items-center gap-10 border border-base-300">

                <div className="relative w-40 h-40 shrink-0 rounded-full ring-4 ring-primary/30 hover:ring-primary/50 transition duration-300">
                    <img
                        src={userData?.profilePic}
                        alt={userData?.name}
                        className="rounded-full w-full h-full object-cover"
                    />
                    <input
                        type="file"
                        className="hidden"
                        id="photo"
                        onChange={(e) => {
                            const selected = e.target.files[0];
                            if (selected) {
                                const validTypes = ["image/jpeg", "image/jpg", "image/png"];
                                const validExtensions = [".jpg", ".jpeg", ".png"];
                                const fileExtension = selected.name
                                    .slice(selected.name.lastIndexOf("."))
                                    .toLowerCase();

                                if (
                                    !validTypes.includes(selected.type) ||
                                    !validExtensions.includes(fileExtension)
                                ) {
                                    alert("Please select a JPG, JPEG, or PNG image");
                                    return;
                                }

                                uploadPhoto(selected);
                            }
                        }}
                    />
                    <label
                        htmlFor="photo"
                        className="absolute bottom-2 right-2 p-2 bg-base-100 border border-primary rounded-full cursor-pointer shadow hover:bg-primary hover:text-white transition"
                        title="Change photo"
                    >
                        <Camera size={20} className="text-primary hover:text-white" />
                    </label>
                </div>
                <div className="text-left space-y-4 w-full">
                    <h2 className="text-3xl font-bold text-base-content">{userData?.name}</h2>
                    <div className="space-y-1">
                        <p className="text-base text-base-content/80">
                            <span className="font-medium text-base-content">Email:</span> {userData?.email}
                        </p>
                        {formattedDate && (
                            <p className="text-base text-base-content/70">
                                <span className="font-medium text-base-content">Joined:</span> {formattedDate}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
