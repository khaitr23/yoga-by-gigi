import Layout from '../components/layout';
import utilStyles from '../styles/utils.module.css';

import Image from 'next/image';
import handsTogetherPic from '../public/images/handsTogether.jpg';
import heroPic from '../public/images/hero.jpg';
import greenPosePic from '../public/images/greenPose.jpg';
import retreatPic from '../public/images/retreat.jpg';
import teachersPic from '../public/images/teachers.jpg';
import waterfrontPic from '../public/images/waterfront.jpg'

export default function Home() {
  return (
    <Layout>
    {/* HERO SECTION */}
    <div className="hero section column">
      <div>
        <h1>Find Your Balance, Breathe Into Peace.</h1>
        <br />
        <p>
          Unlock the power of mindfulness and movement with personalized yoga
          sessions designed to nurture your body, calm your mind, and elevate
          your spirit.
        </p>
        <div id="primary-links">
          <a href="#" className="button">Book an Appointment</a>
        </div>
      </div>
      <div><Image src={heroPic} alt="" layout="intrinsic" unoptimized/></div>
    </div>
    {/* ABOUT GIGI */}
    <div className="hero section column aboutGigi">
      <div className='image-container'><Image src={handsTogetherPic} alt="" layout="intrinsic" unoptimized/></div>
      <div>
        <h2>Meet the Soul Behind the Movement</h2>
        <br />
        <p>
          Hi, I’m Gigi — a certified yoga instructor (RYT® 200) with over 20
          years of experience. I specialize in personalized yoga sessions,
          helping people overcome lower back pain, hip stiffness, and more.
          Whether you're an office worker dealing with posture issues or someone
          seeking a transformative wellness retreat, my goal is to guide you
          towards a healthier, balanced life — on and off the mat. <br />
          <br />
          My yoga journey began in 2004, and over the years, I’ve cultivated a
          deep connection with the practice, gaining certifications from
          renowned institutions like Yoga Vidiya Mandiram in Thailand and
          Nirvana & Ayurveda School in India. <br />
          <br />

          Let’s embark on this path together, and remember — rain or shine, I’ll
          see you on the mat. Namaste.
        </p>
      </div>
    </div>

    <div className="hero section offerings">
      <h2>What I Bring to Your Yoga Practice</h2>
    </div>

    <div className="section hero column">
      <div>
        <h3>Private Yoga Sessions</h3>
        <p>
          Tailored one-on-one classes designed to address specific health
          concerns such as back pain, hip stiffness, or metabolic issues. Each
          session is crafted to support your physical and emotional well-being.
        </p>
      </div>
      <div> <Image src={greenPosePic} alt="" layout="intrinsic" unoptimized/></div>
    </div>
    <div className="section hero column">
      <div><Image src={retreatPic} alt="" layout="intrinsic" unoptimized/></div>
      <div>
        <h3>Yoga Retreats</h3>
        <p>
          Escape the hustle and connect with nature in my curated retreats,
          where mindfulness, meditation, and rejuvenation come together in a
          peaceful setting. Perfect for deepening your practice while surrounded
          by like-minded individuals.
        </p>
      </div>
    </div>
    <div className="section hero column">
      <div>
        <h3>Workshops & Events</h3>
        <p>
          Join me for special workshops focused on rejuvenating metabolism,
          improving digestion, and balancing lifestyle. These events are
          designed to empower you with practical tools for better health.
        </p>
      </div>
      <div><Image src={waterfrontPic} alt="" layout="intrinsic" unoptimized/></div>
    </div>
    <div className="section hero column">
      <div><Image src={teachersPic} alt="" layout="intrinsic" unoptimized/></div>
      <div>
        <h3>Corporate Wellness Programs</h3>
        <p>
          Bringing yoga into the workplace, with sessions aimed at reducing
          stress, improving posture, and tackling issues like neck, shoulder,
          and wrist pain often caused by office work.
        </p>
      </div>
    </div>
    </Layout>
  );
}
