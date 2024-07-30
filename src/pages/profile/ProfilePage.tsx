import React, { useEffect, useState } from "react";
import ProfileInfo from "./ProfileInfo";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/modal/Modal";
import { useTranslation } from "react-i18next";
import {User, UserViewDTO} from "../../service";
import { ButtonType } from "../../components/button/StyledButton";
import { useHttpRequestService } from "../../service/HttpRequestService";
import Button from "../../components/button/Button";
import ProfileFeed from "../../components/feed/ProfileFeed";
import { StyledContainer } from "../../components/common/Container";
import { StyledH5 } from "../../components/common/text";

const ProfilePage = () => {
  const [profile, setProfile] = useState<[User, boolean] | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalValues, setModalValues] = useState({
    text: "",
    title: "",
    type: ButtonType.DEFAULT,
    buttonText: "",
  });
  const service = useHttpRequestService();
  const [user, setUser] = useState<User | null>(null);

  const id = useParams().id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    handleGetUser().then((r) => setUser(r));
  }, []);

  const handleGetUser = async () => {
    if(id) return await service.getProfile(id);
  };

  const following = ()  =>{
    return (profile?.[0].followers.some((r) => r.id === user?.id) !== undefined)
  }

  const handleButtonType = (): { component: ButtonType; text: string } => {
    if (profile?.[0].id === user?.id)
      return { component: ButtonType.DELETE, text: t("buttons.delete") };
    if (following())
      return { component: ButtonType.OUTLINED, text: t("buttons.unfollow") };
    else return { component: ButtonType.FOLLOW, text: t("buttons.follow") };
  };

  const handleSubmit = () => {
    if (profile?.[0].id === user?.id) {
      service.deleteProfile().then(() => {
        localStorage.removeItem("token");
        navigate("/sign-in");
      });
    } else {
      service.unfollowUser(profile![0].id).then(async () => {
        setShowModal(false);
        await getProfileData();
      });
    }
  };

  useEffect(() => {
    getProfileData();
  }, [id]);

  if (!id) return null;

  const handleButtonAction = async () => {
    if (profile?.[0].id === user?.id) {
      setShowModal(true);
      setModalValues({
        title: t("modal-title.delete-account"),
        text: t("modal-content.delete-account"),
        type: ButtonType.DELETE,
        buttonText: t("buttons.delete"),
      });
    } else {
      if (following()) {
        setShowModal(true);
        setModalValues({
          text: t("modal-content.unfollow"),
          title: `${t("modal-title.unfollow")} @${profile?.[0].username}?`,
          type: ButtonType.FOLLOW,
          buttonText: t("buttons.unfollow"),
        });
      } else {
        await service.followUser(id);
        await getProfileData();
      }
    }
  };

  const getProfileData = async () => {
    try {
      const profileData : [User, boolean] = await service.getProfile(id);
      setProfile([
        profileData[0],
        profileData[1],
      ]);
    } catch {
      try {
        const profileViewData = await service.getProfileView(id);
        setProfile([profileViewData, false]);
      } catch (error2) {
        console.log(error2);
      }
    }
  };

  return (
      <>
        <StyledContainer
            maxHeight={"100vh"}
            borderRight={"1px solid #ebeef0"}
            maxWidth={"600px"}
        >
          {profile && (
              <>
                <StyledContainer
                    borderBottom={"1px solid #ebeef0"}
                    maxHeight={"212px"}
                    padding={"16px"}
                >
                  <StyledContainer
                      alignItems={"center"}
                      padding={"24px 0 0 0"}
                      flexDirection={"row"}
                  >
                    <ProfileInfo
                        name={profile[0].name!}
                        username={profile[0].username}
                        profilePicture={profile[0].profilePicture}
                    />
                    <Button
                        buttonType={handleButtonType().component}
                        size={"100px"}
                        onClick={handleButtonAction}
                        text={handleButtonType().text}
                    />
                  </StyledContainer>
                </StyledContainer>
                <StyledContainer width={"100%"}>
                  {following() ? (
                      <ProfileFeed />
                  ) : (
                      <StyledH5>Private account</StyledH5>
                  )}
                </StyledContainer>
                <Modal
                    show={showModal}
                    text={modalValues.text}
                    title={modalValues.title}
                    acceptButton={
                      <Button
                          buttonType={modalValues.type}
                          text={modalValues.buttonText}
                          size={"MEDIUM"}
                          onClick={handleSubmit}
                      />
                    }
                    onClose={() => {
                      setShowModal(false);
                    }}
                />
              </>
          )}
        </StyledContainer>
      </>
  );
};

export default ProfilePage;
