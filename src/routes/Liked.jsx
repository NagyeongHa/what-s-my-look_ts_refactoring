import { useRecoilValue } from 'recoil';
import { likedImagesState } from '../recoil/apiCallSelector';
import '../styles/Look.css';
import NavBar from '../components/NavBar';
import Like from '../components/Like';
import { useEffect } from 'react';
import { authState } from '../recoil/authState';
import { child, push, ref, update } from 'firebase/database';
import { database } from '../components/firebase';
function Liked() {
  const getLikedImagesState = useRecoilValue(likedImagesState);
  const LikedImages = JSON.parse(getLikedImagesState); //로그인 좋아요
  const getUnAuthedLikeImage = sessionStorage.getItem('nonLoginLikedImages');
  const unAuthedLikeImage = JSON.parse(getUnAuthedLikeImage); //비로그인 좋아요
  const authUser = useRecoilValue(authState);

  useEffect(() => {
    if (unAuthedLikeImage && authUser) {
      localStorage.setItem('likedImages', JSON.stringify(unAuthedLikeImage));

      //파이어베이스에 유저정보도 저장
      const newLikeKey = push(child(ref(database), `likes`)).key;

      const likeData = {
        user: authUser.email,
        uuid: newLikeKey,
      };
      const imageIndex = unAuthedLikeImage.map((item) => item.id - 1);
      //유저 저장

      const updates = {};
      updates[`/database/look/${imageIndex}/likes/` + newLikeKey] = likeData;
      update(ref(database), updates);
    }

    const getLikedImages = JSON.parse(localStorage.getItem('likedImages'));
    const deleteLikedImages = getLikedImages.filter(
      (item) => item.id !== unAuthedLikeImage.id
    );

    localStorage.setItem('likedImages', JSON.stringify(deleteLikedImages));
  }, [authUser, unAuthedLikeImage]);

  // console.log(getLikedImagesState.length > 0 ? '있음' : '없음');
  return (
    <>
      <NavBar />
      <div className='card likedPage'>
        {getLikedImagesState ? (
          LikedImages.map((item, idx) => (
            <div key={idx}>
              <img src={item.src} key={item.id} className='image' />
              <div className='icon-wrapper'>
                <Like images={item} />
              </div>
            </div>
          ))
        ) : (
          <div>이미지에 좋아요를 눌러보세요</div>
        )}
      </div>
    </>
  );
}

export default Liked;
