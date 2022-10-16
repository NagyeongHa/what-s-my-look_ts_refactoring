import unLike from '../assets/icon/empty-heart.png';
import like from '../assets/icon/full-heart.png';
import '../styles/like.css';
import { useState, useEffect } from 'react';
import { update, ref, push, child, remove } from 'firebase/database';
import { useRecoilValue } from 'recoil';
import { authState } from '../recoil/authState';
import { database } from './firebase';
import _ from 'lodash';
import { IimageDataProperty } from '../types/IimageDataProperty';
import { IimageProps } from '../types/IimageProps';

const Like = ({ images }: IimageProps) => {
  const [isLike, setIsLike] = useState(false);
  const [lookDatabase, setLookDatabase] = useState({});
  const [unAuthedUser, setUnAuthedUser] = useState(false);

  const authUser = useRecoilValue(authState);
  const imageIndex = images.id - 1;
  const getCountReference = ref(database, `database/look/${imageIndex}`);

  useEffect(() => {
    if (!authUser) {
      setUnAuthedUser(true);
    }
  }, [authUser]);

  useEffect(() => {
    const res = async () => {
      await fetch(
        `https://what-s-my-look-default-rtdb.firebaseio.com/database/look/${imageIndex}.json`
      )
        .then((response) => response.json())
        .then((data) => setLookDatabase(data));
    };
    res();
  }, [imageIndex, isLike]);

  useEffect(() => {
    //비로그인
    const sessionData: IimageDataProperty[] = JSON.parse(
      sessionStorage.getItem('nonLoginLikedImages') || '[]'
    );

    if (!authUser) {
      if (
        sessionData.find(
          (item) => item.id === (lookDatabase as IimageDataProperty).id
        )
      ) {
        setIsLike(true);
        return;
      }
      setIsLike(false);
      return;
    }

    //로그인
    if (authUser) {
      if ((lookDatabase as IimageDataProperty).likes) {
        const userLiked = Object.values(
          (lookDatabase as IimageDataProperty).likes
        );

        if (userLiked.find((item) => item.user === authUser.email)) {
          setIsLike(true);
          return;
        }
      }
      setIsLike(false);
      return;
    }
  }, [authUser, images.id, lookDatabase]);

  const toggleLike = () => {
    if (unAuthedUser) {
      setIsLike(!isLike);
      if (!isLike) {
        alert(
          '로그인 시 위시리스트에서 좋아요한 이미지를 확인하실 수 있습니다.'
        );
      }
    }

    if (isLike) {
      downLike();
      deletelikedImages();
      return;
    }

    if (!isLike) {
      upLike();
      addLikedImages();
      return;
    }
  };

  const upLike = () => {
    setIsLike(true);

    if (authUser) {
      const newLikeKey = push(child(ref(database), `likes`)).key;
      const getLikesReference = ref(
        database,
        `database/look/${imageIndex}/likes/${newLikeKey}`
      );

      update(getLikesReference, {
        user: authUser.email,
        uuid: newLikeKey,
      });

      update(getCountReference, {
        count: (lookDatabase as IimageDataProperty).count + 1,
      });
    }
  };

  //좋아요 취소
  const downLike = () => {
    setIsLike(false);

    //로그인
    if (authUser && (lookDatabase as IimageDataProperty).likes) {
      const toArray = Object.values((lookDatabase as IimageDataProperty).likes);
      const userFilter = toArray.filter((item) => item.user === authUser.email);
      const likesUuid = userFilter[0].uuid;

      const removeUserReference = ref(
        database,
        `database/look/${imageIndex}/likes/${likesUuid}`
      );

      remove(removeUserReference);

      //카운트-1
      update(getCountReference, {
        count: (lookDatabase as IimageDataProperty).count - 1,
      });
    }
  };

  //선택된 이미지 로컬에 추가
  const addLikedImages = () => {
    //로그인
    if (authUser) {
      const prevLocalLike = JSON.parse(
        localStorage.getItem('likedImages') || '[]'
      );

      localStorage.setItem(
        'likedImages',
        JSON.stringify(_.uniqBy([...prevLocalLike, images], 'id'))
      );
      return;
    }

    //비로그인
    if (unAuthedUser) {
      const prevSessionImages = JSON.parse(
        sessionStorage.getItem('nonLoginLikedImages') || '[]'
      );

      sessionStorage.setItem(
        'nonLoginLikedImages',
        JSON.stringify(_.uniqBy([...prevSessionImages, images], 'id'))
      );
    }
  };

  //선택된 이미지 로컬에 제거
  const deletelikedImages = () => {
    //로그인
    if (authUser) {
      const getLocalImages = JSON.parse(
        localStorage.getItem('likedImages') || '[]'
      );

      if (getLocalImages) {
        const deleteLikedImages = getLocalImages.filter(
          (item: IimageDataProperty) => item.id !== images.id
        );

        localStorage.setItem('likedImages', JSON.stringify(deleteLikedImages));
      }
      return;
    }

    //비로그인
    if (unAuthedUser) {
      const prevSessionImages = JSON.parse(
        sessionStorage.getItem('nonLoginLikedImages') || '[]'
      );

      const deleteLikedImages = prevSessionImages.filter(
        (item: IimageDataProperty) => item.id !== images.id
      );

      sessionStorage.setItem(
        'nonLoginLikedImages',
        JSON.stringify(deleteLikedImages)
      );
    }
  };

  return (
    <>
      <div className='like-container'>
        <button onClick={toggleLike}>
          <img src={isLike ? like : unLike} alt='' className='icon like' />
        </button>
        {authUser ? (lookDatabase as IimageDataProperty).count : ''}
      </div>
    </>
  );
};

export default Like;