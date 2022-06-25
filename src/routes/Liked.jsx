import { signOut } from 'firebase/auth';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { auth } from '../components/firebase';
import { modalState } from '../recoil/modalState';
import { likedImagesState } from '../recoil/apiCallSelector';
import '../styles/Look.css';
import NavBar from '../components/NavBar';
import Like from '../components/Like';

function Liked() {
  const handleModal = useSetRecoilState(modalState);
  const getLikedImagesState = useRecoilValue(likedImagesState);
  const LikedImages = JSON.parse(getLikedImagesState);

  const logout = () => {
    signOut(auth).then(alert('logout!'));
    localStorage.removeItem('recoil-persist');

    //navigate('/');
    handleModal((prev) => !prev);
    window.location.href = 'http://localhost:3000/';
    document.body.style.overflow = 'unset';
  };

  // console.log(getLikedImagesState.length > 0 ? '있음' : '없음');
  return (
    <>
      <NavBar handlerLogout={logout} />
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
