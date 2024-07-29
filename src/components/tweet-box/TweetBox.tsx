import React, { useEffect, useState, ChangeEvent } from "react";
import Button from "../button/Button";
import TweetInput from "../tweet-input/TweetInput";
import { useHttpRequestService } from "../../service/HttpRequestService";
import { setLength, updateFeed } from "../../redux/user";
import ImageContainer from "../tweet/tweet-image/ImageContainer";
import { BackArrowIcon } from "../icon/Icon";
import ImageInput from "../common/ImageInput";
import { useTranslation } from "react-i18next";
import { ButtonType } from "../button/StyledButton";
import { StyledTweetBoxContainer } from "./TweetBoxContainer";
import { StyledContainer } from "../common/Container";
import { StyledButtonContainer } from "./ButtonContainer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {PostData, User} from "../../service";

interface TweetBoxProps {
    parentId?: string;
    close?: () => void;
    mobile?: boolean;
}

const TweetBox: React.FC<TweetBoxProps> = ({ parentId, close, mobile }) => {
    const [content, setContent] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [imagesPreview, setImagesPreview] = useState<string[]>([]);

    const { length, query } = useSelector((state: RootState) => state.user);
    const httpService = useHttpRequestService();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const service = useHttpRequestService()
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        handleGetUser().then((r) => setUser(r));
    }, []);

    const handleGetUser = async () => {
        return await service.me();
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            dispatch(setLength(length + 1));
            let data : PostData = {content:content}
            if(images.length>0) data = { ...data, images:images}
            if(parentId !== undefined && parentId !== ""){
                await httpService.createComment(data,parentId);
            } else {
                await httpService.createPost(data);
            }
            const posts = await httpService.getPosts(query);
            dispatch(updateFeed(posts));
            close && close();
        } catch (e) {
            console.log(e);
        } finally {
            setContent("");
            setImages([]);
            setImagesPreview([]);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, idx) => idx !== index);
        const newImagesPreview = newImages.map((i) => URL.createObjectURL(i));
        setImages(newImages);
        setImagesPreview(newImagesPreview);
    };

    const handleAddImage = (newImages: File[]) => {
        setImages(newImages);
        const newImagesPreview = newImages.map((i) => URL.createObjectURL(i));
        setImagesPreview(newImagesPreview);
    };

    return (
        <StyledTweetBoxContainer>
            {mobile && (
                <StyledContainer
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <BackArrowIcon onClick={close} />
                    <Button
                        text="Tweet"
                        buttonType={ButtonType.DEFAULT}
                        size="SMALL"
                        onClick={handleSubmit}
                        disabled={content.length === 0}
                    />
                </StyledContainer>
            )}
            <StyledContainer style={{ width: "100%" }}>
                <TweetInput
                    onChange={handleChange}
                    maxLength={240}
                    placeholder={t("placeholder.tweet")}
                    value={content}
                    src={user?.profilePicture}
                />
                <StyledContainer padding="0 0 0 10%">
                    <ImageContainer
                        editable
                        images={imagesPreview}
                        removeFunction={handleRemoveImage}
                    />
                </StyledContainer>
                <StyledButtonContainer>
                    <ImageInput setImages={handleAddImage} parentId={parentId} />
                    {!mobile && (
                        <Button
                            text="Tweet"
                            buttonType={ButtonType.DEFAULT}
                            size="SMALL"
                            onClick={handleSubmit}
                            disabled={
                                content.length <= 0 ||
                                content.length > 240 ||
                                images.length > 4 ||
                                images.length < 0
                            }
                        />
                    )}
                </StyledButtonContainer>
            </StyledContainer>
        </StyledTweetBoxContainer>
    );
};

export default TweetBox;
