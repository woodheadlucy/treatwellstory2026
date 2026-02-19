import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon, Video, Loader2, ArrowLeft, Sparkles, BarChart3, Shield } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedMedia {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  status: 'analyzing' | 'approved' | 'rejected' | 'error';
  /**
   * Human-readable treatment name/type that will be displayed to customers
   * on the B2C app once the upload has passed validation.
   * Derived from the AI analysis (e.g. "Hair Colouring", "Balayage", etc).
   */
  treatmentName?: string;
  /**
   * Canonical Treatwell treatment ID corresponding to the inferred treatmentName.
   */
  treatmentId?: number;
  aiAnalysis?: {
    contentType: string[];
    tags: string[];
    moderationStatus: 'safe' | 'unsafe';
    moderationReasons?: string[];
    confidence: number;
    flaggedCategories: {
      nudity: boolean;
      profanity: boolean;
      violence: boolean;
      illegalItems: boolean;
      contactInfo: boolean;
      offTopicContent: boolean;
    };
  };
  error?: string;
}

// Canonical Treatwell treatment catalogue used to normalise AI-inferred types
const TREATMENT_TYPES: { id: number; name: string }[] = [
  { id: 1, name: 'Acupressure' },
  { id: 2, name: 'Acupuncture' },
  { id: 3, name: 'Aerobics' },
  { id: 4, name: 'Alexander Technique' },
  { id: 13, name: 'Amatsu' },
  { id: 14, name: 'Angel Therapy' },
  { id: 15, name: 'Aromatherapy' },
  { id: 16, name: 'Ashtanga Yoga' },
  { id: 18, name: 'Ayurvedic' },
  { id: 19, name: 'Bach Flower Remedies' },
  { id: 22, name: 'Bikram Yoga' },
  { id: 24, name: 'Body Pump' },
  { id: 25, name: 'Body Wraps' },
  { id: 26, name: 'Cosmetic Injectables' },
  { id: 27, name: 'Bowen Technique' },
  { id: 28, name: 'Boxercise' },
  { id: 30, name: 'Chemical Skin Peel' },
  { id: 32, name: 'Herbal Medicine and Supplements' },
  { id: 35, name: 'Chiropractic' },
  { id: 36, name: 'Circuit Training' },
  { id: 37, name: 'Colonic Hydrotherapy' },
  { id: 38, name: 'Colour Therapy' },
  { id: 40, name: 'Cellulite Treatments' },
  { id: 41, name: 'Hyperhidrosis Treatment' },
  { id: 44, name: 'Craniosacral Therapy' },
  { id: 45, name: 'Crystal Therapy' },
  { id: 46, name: 'Deep Tissue Massage' },
  { id: 48, name: 'Eyebrow and Eyelash Treatments' },
  { id: 49, name: 'Face Yoga' },
  { id: 50, name: 'Facials' },
  { id: 51, name: 'Gyrotonic Expansion System' },
  { id: 52, name: 'Laser Hair Removal' },
  { id: 54, name: 'Electrolysis' },
  { id: 55, name: 'Sugaring' },
  { id: 56, name: 'Threading' },
  { id: 57, name: 'Waxing' },
  { id: 59, name: 'Healing' },
  { id: 61, name: 'Hellerwork' },
  { id: 62, name: 'Herbal & Flower Essence' },
  { id: 63, name: 'Homeopathy' },
  { id: 64, name: 'Ear Candling' },
  { id: 65, name: 'Stone Massage Therapy' },
  { id: 66, name: 'Hydrotherapy' },
  { id: 67, name: 'Hypnotherapy' },
  { id: 69, name: 'Iridology' },
  { id: 70, name: 'Isologen Process' },
  { id: 72, name: 'Kickboxing' },
  { id: 73, name: 'Kinesiology' },
  { id: 74, name: 'Laser Treatment - Thread Veins' },
  { id: 75, name: 'Laser Treatments - Resurfacing' },
  { id: 76, name: 'Laser Treatments - Skin Rejuvenation' },
  { id: 77, name: 'Light Therapy' },
  { id: 79, name: 'Lymphatic Drainage' },
  { id: 81, name: 'Manicure' },
  { id: 82, name: 'Therapeutic Massage' },
  { id: 84, name: 'Naturopathy' },
  { id: 85, name: 'Nutritional Advice & Treatments' },
  { id: 86, name: 'Osteopathy' },
  { id: 87, name: 'Pedicure' },
  { id: 88, name: 'Personal Training' },
  { id: 89, name: 'Pilates' },
  { id: 91, name: 'Psychic Love Coaching' },
  { id: 92, name: 'Qigong' },
  { id: 93, name: 'Radionics' },
  { id: 94, name: 'Raja Yoga' },
  { id: 95, name: 'Reflexology' },
  { id: 96, name: 'Reiki' },
  { id: 112, name: 'Rolfing' },
  { id: 114, name: 'Shiatsu Massage' },
  { id: 115, name: 'Breast Enlargement' },
  { id: 116, name: 'Breast Reduction - Female' },
  { id: 119, name: 'Collagen Treatments' },
  { id: 120, name: 'Combined Decongestive Therapy' },
  { id: 121, name: 'Daoyin Tao' },
  { id: 122, name: 'Dermal Fillers' },
  { id: 124, name: 'Doula Birth Companion' },
  { id: 125, name: 'Emotional Therapy' },
  { id: 126, name: 'Energy Therapy' },
  { id: 128, name: 'Facials - CACI' },
  { id: 130, name: 'Feng Shui' },
  { id: 133, name: 'Acne Treatments' },
  { id: 138, name: 'Krav Maga' },
  { id: 139, name: 'Lamaze' },
  { id: 141, name: 'Pre and Post Natal Massage' },
  { id: 142, name: 'Skin Lightening' },
  { id: 143, name: 'Spinning' },
  { id: 144, name: 'Tai Chi' },
  { id: 145, name: 'Teeth Whitening' },
  { id: 146, name: 'Turkish Bath' },
  { id: 148, name: 'Steam and Sauna Therapy' },
  { id: 149, name: 'Sports Massage' },
  { id: 150, name: 'Stretching' },
  { id: 151, name: 'Swedish Massage' },
  { id: 152, name: 'Sunbeds and Tanning Booths' },
  { id: 153, name: 'Spray Tanning and Sunless Tanning' },
  { id: 155, name: 'Thai Massage' },
  { id: 157, name: 'Trager Approach' },
  { id: 158, name: 'Traditional Chinese Medicine' },
  { id: 159, name: 'Tui Na Massage' },
  { id: 160, name: 'Yoga' },
  { id: 164, name: "Men's Shaving" },
  { id: 166, name: 'Haircuts and Hairdressing' },
  { id: 172, name: 'Aromatherapy Massage' },
  { id: 173, name: 'Image Consulting' },
  { id: 178, name: 'Swimming' },
  { id: 184, name: 'Body Exfoliation Treatments' },
  { id: 191, name: 'Foot Massage' },
  { id: 196, name: 'Cosmetic Surgery' },
  { id: 197, name: 'Liposuction' },
  { id: 198, name: 'Rhinoplasty' },
  { id: 199, name: 'Mole Removal' },
  { id: 201, name: 'Face Lift' },
  { id: 203, name: 'Cheek Enhancement' },
  { id: 205, name: 'Body Treatments - CACI' },
  { id: 206, name: 'Scar Tissue Treatments' },
  { id: 207, name: 'Breathing Techniques' },
  { id: 209, name: 'Indian Head Massage' },
  { id: 212, name: 'Makeup Treatments' },
  { id: 214, name: 'Dental Treatments' },
  { id: 215, name: 'Fresh Breath Treatments' },
  { id: 216, name: 'Implants (non Breast)' },
  { id: 217, name: 'Cupping' },
  { id: 219, name: 'Sleep Treatments' },
  { id: 223, name: 'Physiotherapy' },
  { id: 225, name: 'Intuitive Readings' },
  { id: 226, name: 'Strength Training' },
  { id: 227, name: 'Meditation' },
  { id: 229, name: 'Ki Therapy' },
  { id: 231, name: 'Hair Loss Treatments - Non Surgical' },
  { id: 235, name: 'Breast Reduction - Male' },
  { id: 241, name: 'Microdermabrasion' },
  { id: 242, name: 'Kundalini Yoga' },
  { id: 243, name: 'Life Coaching' },
  { id: 244, name: 'Grinberg Method' },
  { id: 246, name: 'Backcials' },
  { id: 247, name: 'Rasul and Mud Treatments' },
  { id: 248, name: 'Nail Extensions & Overlays' },
  { id: 249, name: 'Lomi Lomi Massage' },
  { id: 251, name: 'Piercing' },
  { id: 253, name: 'Cosmetic Skin Treatments' },
  { id: 254, name: 'Cryotherapy' },
  { id: 255, name: 'Sex Counselling' },
  { id: 256, name: 'Shirodhara' },
  { id: 257, name: 'Four Hands Massage' },
  { id: 258, name: 'Laser Eye Surgery' },
  { id: 259, name: 'Feldenkrais Method' },
  { id: 262, name: 'Tummy tuck' },
  { id: 263, name: 'Ultrasound Therapy' },
  { id: 266, name: 'Vibration Plate Training' },
  { id: 270, name: 'Scalp Reduction' },
  { id: 271, name: 'Psychotherapy' },
  { id: 272, name: 'Dermaplaning' },
  { id: 273, name: 'Hair Colouring and Highlights Treatments' },
  { id: 274, name: 'Suspension Training' },
  { id: 276, name: 'Trigger Point Therapy' },
  { id: 278, name: 'Facial Rejuvenation Acupuncture' },
  { id: 279, name: 'Breast Fillers' },
  { id: 281, name: 'Jivamukti Yoga' },
  { id: 282, name: 'Vinyasa Yoga' },
  { id: 283, name: 'Windsurfing' },
  { id: 284, name: 'Tennis' },
  { id: 286, name: 'Tattoo Removal' },
  { id: 288, name: 'Surfing' },
  { id: 290, name: 'Capoeira' },
  { id: 291, name: 'Thread Vein Treatment' },
  { id: 292, name: 'Lipo-Injection' },
  { id: 296, name: 'Iyengar Yoga' },
  { id: 299, name: 'Carnival Slam' },
  { id: 300, name: 'Neuro Linguistic programming' },
  { id: 301, name: 'Body Attack' },
  { id: 305, name: 'Jujitsu' },
  { id: 307, name: 'Taekwon-Do' },
  { id: 308, name: "Children's Yoga" },
  { id: 309, name: 'Ballet' },
  { id: 310, name: 'Street Dance' },
  { id: 311, name: 'Belly Dancing' },
  { id: 312, name: 'Karate' },
  { id: 313, name: 'Pole Dancing' },
  { id: 314, name: 'Ballroom Dancing' },
  { id: 315, name: 'Bollywood Dancing' },
  { id: 317, name: 'Aqua Aerobics' },
  { id: 318, name: 'Kung Fu' },
  { id: 319, name: 'Running' },
  { id: 320, name: 'Body Sculpting' },
  { id: 321, name: 'Photorejuvenation Treatments' },
  { id: 323, name: 'Counselling' },
  { id: 326, name: 'Step Aerobics' },
  { id: 328, name: 'Ballet Yoga Fusion' },
  { id: 330, name: 'Aikido' },
  { id: 331, name: 'Wing Tsun' },
  { id: 332, name: 'Body Balance' },
  { id: 333, name: 'Body Step' },
  { id: 335, name: 'Hand Massage' },
  { id: 336, name: 'Hair Extensions' },
  { id: 337, name: 'Speech Therapy' },
  { id: 339, name: 'Muay Thai' },
  { id: 342, name: 'Face Massage' },
  { id: 343, name: 'Addictions Counselling' },
  { id: 346, name: 'Sivananda Yoga' },
  { id: 349, name: 'Ananda Yoga' },
  { id: 350, name: 'Anusara Yoga' },
  { id: 351, name: 'Forrest Yoga' },
  { id: 352, name: 'Dahn Yoga' },
  { id: 353, name: 'Integral Yoga' },
  { id: 354, name: 'TriYoga' },
  { id: 355, name: 'Kripalu Yoga' },
  { id: 356, name: 'Kriya Yoga' },
  { id: 357, name: 'Sahaja Yoga' },
  { id: 358, name: 'Scaravelli Yoga' },
  { id: 359, name: 'Prana Flow' },
  { id: 360, name: 'Svaroopa(R) Yoga' },
  { id: 361, name: 'Viniyoga' },
  { id: 362, name: 'Yin Yoga' },
  { id: 363, name: 'Yogilates' },
  { id: 364, name: 'QiYoga' },
  { id: 365, name: 'Mesotherapy' },
  { id: 366, name: 'Fencing' },
  { id: 367, name: 'Salsa' },
  { id: 368, name: 'Latin Dancing' },
  { id: 369, name: 'Thermography' },
  { id: 370, name: 'Walking Groups' },
  { id: 371, name: 'Dynamic Yoga' },
  { id: 372, name: 'Karma Yoga' },
  { id: 373, name: 'Bhakti Yoga' },
  { id: 374, name: 'Jnana Yoga' },
  { id: 376, name: 'Self Defence' },
  { id: 377, name: 'Canoeing' },
  { id: 378, name: 'Gyrokinesis' },
  { id: 379, name: 'Burlesque' },
  { id: 380, name: 'Metamorphic Technique' },
  { id: 382, name: 'Skincare Consultation' },
  { id: 383, name: 'BodyTalk' },
  { id: 384, name: 'Myofascial Release Therapy' },
  { id: 385, name: 'Cognitive Behaviour Therapy' },
  { id: 386, name: 'Can-Can' },
  { id: 388, name: 'Psychology' },
  { id: 389, name: 'Styling' },
  { id: 391, name: 'Coaching' },
  { id: 392, name: 'Rock Climbing' },
  { id: 393, name: 'Orthodontics' },
  { id: 394, name: 'Timeline Therapy' },
  { id: 395, name: 'Allergy Testing' },
  { id: 396, name: 'Lindy Hop' },
  { id: 397, name: 'Body Conditioning' },
  { id: 398, name: 'Infrared Therapy' },
  { id: 399, name: 'Intense Pulsed Light Therapy (IPL)' },
  { id: 400, name: 'Lava Shells Massage' },
  { id: 401, name: 'Waterskiing' },
  { id: 402, name: 'Mountain Biking' },
  { id: 403, name: 'Golf' },
  { id: 404, name: 'Squash' },
  { id: 406, name: 'Stress Management' },
  { id: 407, name: 'Ayurvedic Massages' },
  { id: 408, name: 'Henna Designs and Tattoos' },
  { id: 409, name: 'Boxing' },
  { id: 411, name: 'Martial Arts' },
  { id: 412, name: 'Face Lift - Nonsurgical' },
  { id: 413, name: 'Weight Loss Treatments' },
  { id: 414, name: 'Bust Treatments and Enhancement' },
  { id: 415, name: 'Brazilian Waxing' },
  { id: 419, name: 'Autogenic Therapy' },
  { id: 420, name: 'Cardio Training' },
  { id: 421, name: 'Glasses' },
  { id: 422, name: 'Eye Tests' },
  { id: 423, name: 'Contact Lenses' },
  { id: 424, name: 'Intraocular Lenses' },
  { id: 425, name: 'Permanent and Semi-Permanent Makeup Treatments' },
  { id: 427, name: 'Brazilian Blow Dry Keratin Treatment' },
  { id: 428, name: 'Chakra Massage' },
  { id: 429, name: 'Chair Massage' },
  { id: 430, name: 'Hula' },
  { id: 431, name: 'Hula Hoop' },
  { id: 432, name: 'Legs, Bums and Tums' },
  { id: 433, name: 'Ear Pinning' },
  { id: 434, name: 'Cosmetic Dental Treatments' },
  { id: 435, name: 'Natural Breast Enlargement' },
  { id: 436, name: 'Mastopexy' },
  { id: 438, name: 'Skiing' },
  { id: 439, name: 'Oxygen Facial' },
  { id: 440, name: 'Acustaple' },
  { id: 441, name: 'Hasya yoga' },
  { id: 442, name: 'Dracula Therapy' },
  { id: 444, name: 'Ice Skating' },
  { id: 446, name: 'Naprapathy' },
  { id: 449, name: 'Halotherapy' },
  { id: 450, name: 'Zumba' },
  { id: 451, name: 'Swedercise' },
  { id: 452, name: 'Magnetic Therapy' },
  { id: 457, name: 'Piloxing' },
  { id: 458, name: 'Hatha Yoga' },
  { id: 459, name: 'Water Crew' },
  { id: 460, name: 'Chiropody' },
  { id: 461, name: 'Trapeze' },
  { id: 462, name: 'Acrobatics' },
  { id: 464, name: 'Yoga Power Plate' },
  { id: 465, name: 'Blow Dry' },
  { id: 470, name: 'Areola Reconstruction' },
  { id: 471, name: 'Hair Simulation' },
  { id: 472, name: 'Vaginal Tightening' },
  { id: 473, name: 'Buttock Implants' },
  { id: 474, name: 'Arm Lift' },
  { id: 475, name: 'Thigh Lift' },
  { id: 477, name: 'Mole/Cyst Removal' },
  { id: 478, name: 'LED Light Therapy' },
  { id: 479, name: 'Skin Tightening' },
  { id: 480, name: 'Line Dancing' },
  { id: 482, name: 'Egyptian Dance' },
  { id: 483, name: 'Mind Boxing' },
  { id: 484, name: 'Hair Consulting' },
  { id: 485, name: 'Hair Conditioning and Scalp Treatments' },
  { id: 486, name: 'Permanent Waves' },
  { id: 487, name: 'Weight Loss Hypnotherapy' },
  { id: 490, name: 'Barre Work' },
  { id: 491, name: 'Anger Management' },
  { id: 492, name: 'Beard Trimming' },
  { id: 496, name: 'Prenatal Yoga' },
  { id: 497, name: 'Power Yoga' },
  { id: 498, name: 'Baptiste Power Yoga' },
  { id: 500, name: 'Poi Spinning' },
  { id: 501, name: 'Kettlebells' },
  { id: 502, name: 'Tap Dancing' },
  { id: 503, name: 'Cheerleading' },
  { id: 504, name: 'DeRose Method' },
  { id: 505, name: 'Football' },
  { id: 506, name: 'Satyananda Yoga®' },
  { id: 507, name: 'Jazz Dance' },
  { id: 508, name: 'Modern Dance' },
  { id: 509, name: 'Floatation' },
  { id: 512, name: 'Gastric Band' },
  { id: 515, name: 'Kayoga™' },
  { id: 516, name: 'Carboxytherapy' },
  { id: 517, name: 'Micro-Needling' },
  { id: 518, name: 'Hollywood Waxing' },
  { id: 519, name: 'Dream Therapy' },
  { id: 521, name: 'Aqua Yoga' },
  { id: 522, name: 'Aquanatal' },
  { id: 523, name: 'Yamuna Body Rolling' },
  { id: 524, name: 'Somatic Experiencing®' },
  { id: 525, name: 'Body Treatments' },
  { id: 526, name: 'Hypoxi Therapy' },
  { id: 527, name: 'Iyashi Dome' },
  { id: 530, name: 'Callanetics' },
  { id: 531, name: 'Zen Swimming' },
  { id: 532, name: 'Functional Training' },
  { id: 534, name: 'Hydrating Facial' },
  { id: 535, name: 'Foto Facial RF™ Skin Rejuvenation' },
  { id: 536, name: 'Kayaking' },
  { id: 537, name: "Men's Facial" },
  { id: 539, name: 'Multi Polar Radio Frequency Treatment' },
  { id: 540, name: 'Gel Nails' },
  { id: 541, name: 'Judo' },
  { id: 542, name: 'Biking' },
  { id: 543, name: 'Paraffin Wax Treatments' },
  { id: 544, name: 'Japanese Straightening' },
  { id: 545, name: 'Male Waxing' },
  { id: 546, name: 'Ionic Foot Bath' },
  { id: 547, name: 'Roxy Beach Body Workout' },
  { id: 548, name: 'Nalini Method' },
  { id: 549, name: 'Hot Yoga' },
  { id: 550, name: 'Teen Facials' },
  { id: 555, name: 'Tooth Jewellery' },
  { id: 556, name: 'Dermatology' },
  { id: 557, name: 'TUG Breast Reconstruction' },
  { id: 559, name: 'Chair Aerobics' },
  { id: 560, name: 'HD Brows™' },
  { id: 563, name: 'Bioresonance Therapy' },
  { id: 564, name: 'UVB Photo-biological Stimulation ­therapy' },
  { id: 565, name: 'Budokon' },
  { id: 566, name: 'Exergaming' },
  { id: 567, name: 'Gravity Training' },
  { id: 571, name: 'Moxibustion' },
  { id: 574, name: 'HypnoBirthing' },
  { id: 575, name: 'Shamanic Healing' },
  { id: 578, name: 'Nail Art' },
  { id: 580, name: 'Cryolipolysis' },
  { id: 582, name: 'Disco' },
  { id: 583, name: 'Restorative Yoga' },
  { id: 584, name: 'Neuro-skeletal Realignment Therapy' },
  { id: 585, name: 'CrossFit' },
  { id: 586, name: 'Mindfulness' },
  { id: 588, name: 'Thought Field Therapy' },
  { id: 589, name: 'Grief Recovery' },
  { id: 590, name: 'Past Life Regression Therapy' },
  { id: 591, name: 'Dorn Method' },
  { id: 593, name: 'Herbal Compress Massage' },
  { id: 594, name: 'Samba' },
  { id: 595, name: 'Two Week Manicure' },
  { id: 596, name: 'The Lightning Process' },
  { id: 597, name: 'Bootcamp Workout' },
  { id: 599, name: 'Sophrology' },
  { id: 602, name: 'Snake Yoga' },
  { id: 603, name: 'Universal Contour Wrap' },
  { id: 605, name: 'Horse Riding' },
  { id: 607, name: 'Trampolining' },
  { id: 610, name: 'Rugby' },
  { id: 612, name: 'No Needle Mesotherapy' },
  { id: 613, name: 'BioMeridian Analysis' },
  { id: 615, name: 'Jacobs Ladder' },
  { id: 616, name: 'PowerBike' },
  { id: 624, name: 'Ping Pong' },
  { id: 626, name: 'Fertility Testing' },
  { id: 628, name: 'Chicago Facelift' },
  { id: 629, name: 'Shaolin Kung Fu' },
  { id: 630, name: 'Health Consultations' },
  { id: 632, name: 'Swing Dancing' },
  { id: 635, name: 'The Rossiter System' },
  { id: 636, name: 'Arvigo Therapy' },
  { id: 638, name: 'Necklift' },
  { id: 641, name: 'Biofeedback' },
  { id: 643, name: 'Archery' },
  { id: 644, name: 'Athletics' },
  { id: 645, name: 'Badminton' },
  { id: 646, name: 'Basketball' },
  { id: 647, name: 'Volleyball' },
  { id: 648, name: 'Diving' },
  { id: 649, name: 'Gymnastics' },
  { id: 650, name: 'Handball' },
  { id: 651, name: 'Hockey' },
  { id: 653, name: 'Water Polo' },
  { id: 655, name: 'Rowing' },
  { id: 656, name: 'Ionocinesis' },
  { id: 661, name: 'Jazzercise' },
  { id: 664, name: 'Skipping' },
  { id: 667, name: 'Booiaka' },
  { id: 668, name: 'Hippotherapy' },
  { id: 671, name: 'Barefoot Running' },
  { id: 673, name: 'AntiGravity Yoga' },
  { id: 676, name: 'Aerial Silks' },
  { id: 678, name: 'Sclerotherapy' },
  { id: 679, name: 'Glow Yoga' },
  { id: 680, name: 'Snow Boarding' },
  { id: 684, name: 'Wedding Hair' },
  { id: 685, name: 'The Emmett Technique' },
  { id: 686, name: 'Post Natal Yoga' },
  { id: 687, name: 'Callus Peel' },
  { id: 689, name: 'Electrotherapy' },
  { id: 691, name: 'Meridian Therapies' },
  { id: 694, name: 'Bamboo Massage' },
  { id: 698, name: 'Passive Exercise' },
  { id: 702, name: 'NeuroSpa' },
  { id: 704, name: 'Aqua Cycling' },
  { id: 706, name: 'Eyelash Extensions' },
  { id: 707, name: 'Eyelash Perming' },
  { id: 708, name: 'LVL Lashes' },
  { id: 709, name: 'Eyebrow and Eyelash Tinting' },
  { id: 711, name: 'Afro Hairdressing' },
  { id: 714, name: 'Balayage' },
  { id: 715, name: 'Braids' },
  { id: 716, name: "Men's Haircuts and Hairdressing" },
  { id: 717, name: 'Makeover Experiences' },
  { id: 718, name: 'Teeth Cleaning' },
  { id: 719, name: 'Eyebrow Threading' },
  { id: 720, name: 'Two Week Pedicure' },
  { id: 721, name: 'Hair Styling and Updos' },
  { id: 722, name: 'Body Hair Bleaching' },
  { id: 724, name: 'Eyebrow Waxing' },
  { id: 729, name: "Children's Haircuts" },
  { id: 730, name: 'Couples Massage' },
  { id: 731, name: "Men's Hair Colouring and Greys Coverage" },
  { id: 732, name: 'Hair Salon Extras' },
  { id: 733, name: 'Beauty Salon Extras' },
  { id: 734, name: 'Hair Removal Extras' },
  { id: 735, name: 'Natural Nail Strengthening' },
  { id: 736, name: 'Nail Refill' },
  { id: 737, name: 'Nail or Gel Polish Removal' },
  { id: 739, name: 'Nail Salon Extras' },
  { id: 740, name: 'Other Massages' },
  { id: 741, name: 'PRP Therapy' },
  { id: 742, name: 'Quiromassage' },
  { id: 743, name: 'Oxygen Body Treatments' },
  { id: 744, name: 'Bikini Waxing' },
  { id: 745, name: 'Leg Waxing' },
  { id: 746, name: 'Pressotherapy' },
  { id: 747, name: 'Connective Tissue Massage' },
  { id: 748, name: "Men's Brazilian Blow Dry" },
  { id: 749, name: 'Chemical Straightening' },
  { id: 750, name: 'Facial Waxing' },
  { id: 751, name: "Ladies' Arm & Underarm Waxing" },
  { id: 752, name: 'Microblading' },
  { id: 753, name: 'Relaxing Massage' },
  { id: 754, name: 'Lipo Treatments' },
  { id: 755, name: 'Weave' },
  { id: 756, name: 'Solar Nails' },
  { id: 757, name: 'Acrylic Nail Extensions & Overlays' },
  { id: 758, name: 'Radiofrequency Facial' },
  { id: 759, name: 'Russian Volume Lashes' },
  { id: 760, name: 'Hybrid Lashes' },
  { id: 761, name: 'Party Lashes' },
  { id: 762, name: 'Eyelash Extension Infills' },
  { id: 763, name: 'Eyelash Extension Removal' },
  { id: 764, name: 'Classic Lashes' },
  { id: 765, name: 'Wedding Hair Trial' },
  { id: 766, name: "Boys' Haircuts" },
  { id: 767, name: "Girls' Haircuts" },
  { id: 768, name: "Ladies' Organic Hair Colouring" },
  { id: 769, name: "Men's Organic Hair Colouring" },
  { id: 770, name: "Ladies' Ammonia-Free Hair Colouring" },
  { id: 771, name: "Men's Ammonia-Free Hair Colouring" },
  { id: 772, name: 'Fringe Trim' },
  { id: 773, name: "Ladies' Hair Toner" },
  { id: 774, name: "Ladies' Highlights" },
  { id: 775, name: "Ladies' Full Head Highlights" },
  { id: 776, name: "Ladies' Half Head Highlights" },
  { id: 777, name: "Ladies' T-Section Highlights" },
  { id: 778, name: "Ladies' Full Head Colouring" },
  { id: 779, name: "Ladie's Root Colouring" },
  { id: 780, name: "Ladies' Hair Bleaching" },
  { id: 781, name: 'Hair Curling' },
  { id: 782, name: "Men's Hair Conditioning & Scalp Treatments" },
  { id: 783, name: 'Wigs' },
  { id: 784, name: 'Afro Hair Extensions' },
  { id: 785, name: 'Afro Braids' },
  { id: 786, name: "Ladies' Afro Hair Colouring" },
  { id: 787, name: 'Silk Press' },
  { id: 788, name: "Men's Afro Haircuts" },
  { id: 789, name: "Ladies' Afro Haircuts" },
  { id: 790, name: "Ladies' Hair Glossing" },
  { id: 791, name: "Men's Hair Bleaching" },
  { id: 792, name: "Ladies' Dry Haircut" },
  { id: 793, name: "Ladies' Restyle Haircut" },
  { id: 794, name: 'Curly Blow Dry' },
  { id: 795, name: "Men's Dry Haircut" },
  { id: 796, name: 'Ombre Hair' },
  { id: 797, name: 'Dip Dye' },
  { id: 798, name: 'Curly Haircut' },
  { id: 799, name: "Ladies' Semi-Permanent Hair Colouring" },
  { id: 800, name: "Ladies' Haircut & Blow Dry" },
  { id: 801, name: 'Colour Correction' },
  { id: 802, name: 'Brow Lamination' },
  { id: 803, name: 'Dipping Powder Nails' },
  { id: 804, name: 'Ombré Nails' },
  { id: 805, name: 'Japanese Manicure' },
  { id: 806, name: 'Henna Brows' },
  { id: 807, name: 'Deep Cleansing Facial' },
  { id: 809, name: 'HIFU Facial' },
];

function mapContentTypeToTreatment(contentType?: string): { id: number; name: string } | undefined {
  if (!contentType) return undefined;
  const normalized = contentType.trim().toLowerCase();
  if (!normalized) return undefined;

  // Exact match
  const exact = TREATMENT_TYPES.find(t => t.name.toLowerCase() === normalized);
  if (exact) return exact;

  // Partial match (either direction)
  const partial = TREATMENT_TYPES.find(t => {
    const n = t.name.toLowerCase();
    return normalized.includes(n) || n.includes(normalized);
  });
  return partial;
}

// ─── AI Moderation Helpers ────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.addEventListener('loadeddata', () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    });
    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
      } catch (e) {
        reject(e);
      }
    });
    video.addEventListener('error', reject);
    video.load();
  });
}

async function analyzeMediaWithClaude(file: File): Promise<UploadedMedia['aiAnalysis']> {
  const isVideo = file.type.startsWith('video/');
  const mediaType = isVideo ? 'image/jpeg' : file.type;
  const base64Data = isVideo ? await extractVideoFrame(file) : await fileToBase64(file);
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  const model =
    (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined) ??
    'claude-sonnet-4-20250514';

  if (!apiKey) {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY. Add it to your .env and restart the dev server.');
  }

  const systemPrompt = `You are a professional content moderation AI for a beauty & wellness marketplace called Treatwell.
Analyse the image and return a structured JSON response.

Check for:
1. Nudity or sexual content (any level)
2. Profanity or offensive text visible in the image
3. Violence or gore
4. Drugs, weapons, or illegal items
5. Contact information (phone numbers, emails, social media handles)
6. Off-topic content — this platform only allows: haircuts, hair colouring, manicures, pedicures, facials, massages, makeup, hair styling, skincare, waxing, brow/lash treatments

Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:
{
  "moderationStatus": "safe",
  "moderationReasons": [],
  "contentType": "e.g. Hair Colouring",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.95,
  "flaggedCategories": {
    "nudity": false,
    "profanity": false,
    "violence": false,
    "illegalItems": false,
    "contactInfo": false,
    "offTopicContent": false
  }
}

Set moderationStatus to "unsafe" and populate moderationReasons with clear user-friendly explanations if any category is flagged.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            {
              type: 'text',
              text: isVideo
                ? 'This is a frame extracted from a video upload. Please moderate it.'
                : 'Please moderate this image upload.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 404) {
      throw new Error(
        `Moderation API error (404): model "${model}" not found for this API key. ` +
        `Double-check VITE_ANTHROPIC_MODEL against the /v1/models list. Raw: ${err}`
      );
    }
    throw new Error(`Moderation API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const raw = data.content.map((b: { text?: string }) => b.text ?? '').join('');
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return {
    contentType: [parsed.contentType ?? 'Unknown'],
    tags: parsed.tags ?? [],
    moderationStatus: parsed.moderationStatus,
    moderationReasons: parsed.moderationReasons ?? [],
    confidence: parsed.confidence ?? 0.9,
    flaggedCategories: parsed.flaggedCategories ?? {
      nudity: false,
      profanity: false,
      violence: false,
      illegalItems: false,
      contactInfo: false,
      offTopicContent: false,
    },
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StoryUploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) return;

    // Clear existing media
    uploadedMedia.forEach(media => URL.revokeObjectURL(media.url));

    const url = URL.createObjectURL(file);
    const newMedia: UploadedMedia = {
      id: Math.random().toString(36).substring(7),
      file,
      url,
      type: isImage ? 'image' : 'video',
      status: 'analyzing',
    };

    setUploadedMedia([newMedia]);

    if (fileInputRef.current) fileInputRef.current.value = '';

    // Real AI moderation
    try {
      const analysis = await analyzeMediaWithClaude(file);
      const primaryContentType = analysis?.contentType?.[0];
      const mappedTreatment = mapContentTypeToTreatment(primaryContentType);

      setUploadedMedia(prev =>
        prev.map(m =>
          m.id !== newMedia.id ? m : {
            ...m,
            status: analysis!.moderationStatus === 'safe' ? 'approved' : 'rejected',
            treatmentName: mappedTreatment?.name ?? primaryContentType,
            treatmentId: mappedTreatment?.id,
            aiAnalysis: analysis,
          }
        )
      );
    } catch (err) {
      setUploadedMedia(prev =>
        prev.map(m =>
          m.id !== newMedia.id ? m : {
            ...m,
            status: 'error',
            error: (err as Error).message,
          }
        )
      );
    }
  };

  const removeMedia = (id: string) => {
    setUploadedMedia(prev => {
      const media = prev.find(m => m.id === id);
      if (media) URL.revokeObjectURL(media.url);
      return prev.filter(m => m.id !== id);
    });
  };

  const handlePublish = async () => {
    const approvedMedia = uploadedMedia.filter(m => m.status === 'approved');
    if (approvedMedia.length > 0) {
      setIsPublishing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsPublishing(false);
      setShowSuccessDialog(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    setUploadedMedia([]);
    onOpenChange(false);
  };

  const approvedCount = uploadedMedia.filter(m => m.status === 'approved').length;
  const analyzingCount = uploadedMedia.filter(m => m.status === 'analyzing').length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[var(--radius-card)] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-chart-2/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} className="text-chart-2" />
              </div>
              <h2 className="mb-3" style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)' }}>
                🎉 Your Stories Are Going Live!
              </h2>
              <p className="text-muted-foreground mb-6" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Amazing! Your stories will appear on the Treatwell marketplace in the next few minutes and start attracting customers.
              </p>
              <div className="bg-primary/10 border border-primary/30 rounded-[var(--radius-lg)] p-5 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-foreground mb-1.5" style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)' }}>
                      Track Your Success
                    </h4>
                    <p className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      Visit the <strong className="text-foreground">Reports</strong> section to see how many customers viewed your stories and placed bookings. Watch your engagement grow! 📈
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={handleSuccessClose} className="w-full" size="lg">Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-foreground" style={{ fontSize: '24px', fontWeight: 'var(--font-weight-semibold)' }}>
                Story Showcase - Upload Content
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handlePublish} disabled={approvedCount === 0 || analyzingCount > 0}>
              {isPublishing ? <Loader2 size={20} className="animate-spin" /> : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-8 py-8">

          {/* Conditional Banner */}
          {uploadedMedia.length === 0 ? (
            <div className="bg-primary/10 border-l-4 border-primary rounded-[var(--radius)] p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full p-3 mt-0.5">
                  <ImageIcon size={28} />
                </div>
                <div>
                  <h4 className="mb-2" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                    Publish to Treatwell Marketplace
                  </h4>
                  <p className="text-muted-foreground" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Your content will be displayed to thousands of potential customers browsing Treatwell.
                    High-quality stories help attract new customers and showcase your best work to people actively looking to book treatments.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-primary/10 border-l-4 border-primary rounded-[var(--radius)] p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full p-3 mt-0.5">
                  <Sparkles size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="mb-2" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                    AI-Powered Customer Matching
                  </h4>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Your stories will be shown to customers most likely to book your services.
                  </p>
                  <div className="bg-card/50 rounded-[var(--radius)] p-4">
                    <p className="text-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Reach new customers</span> based on their preferences, location, and booking history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Layout */}
          {uploadedMedia.length === 0 ? (
            <div className="grid grid-cols-[1fr_420px] gap-10 mb-8">
              {/* Upload Area */}
              <div>
                <div
                  className="border-2 border-dashed border-border rounded-[var(--radius)] p-16 text-center cursor-pointer hover:border-primary transition-colors min-h-[400px] flex flex-col items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto mb-8 text-muted-foreground" size={72} />
                  <p className="mb-4" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
                    Images (PNG, JPG) or Videos (MP4, MOV, max 10 seconds) - Max 50MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-card border border-border rounded-[var(--radius)] p-7 h-fit sticky top-8">
                <h4 className="mb-6" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
                  📋 Upload Guidelines
                </h4>
                <ul className="space-y-5" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {[
                    ['Vertical format', 'Content must be in vertical/portrait orientation (9:16 ratio recommended)'],
                    ['High quality', 'Upload clear, well-lit, high-resolution images and videos'],
                    ['No contact information', "Don't include phone numbers, email addresses, or external social media handles"],
                    ['Appropriate content only', 'No medical procedures, nudity, or sensitive content'],
                  ].map(([title, desc], i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span
                        className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <strong className="text-foreground">{title}:</strong>
                        <span className="text-muted-foreground"> {desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[400px_1fr] gap-8 mb-8">
              {/* Left: Media Preview */}
              <div>
                {uploadedMedia.map(media => (
                  <CompactMediaPreview key={media.id} media={media} onRemove={() => removeMedia(media.id)} />
                ))}
              </div>

              {/* Right: AI Analysis */}
              <div>
                {uploadedMedia.map(media => (
                  <AIAnalysisPanel key={media.id} media={media} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      {approvedCount > 0 && (
        <div className="border-t border-border bg-muted/30">
          <div className="max-w-[1600px] mx-auto px-8 py-4">
            <p className="text-muted-foreground" style={{ fontSize: '15px' }}>
              {approvedCount} item{approvedCount !== 1 ? 's' : ''} ready to publish
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CompactMediaPreview (unchanged from original) ────────────────────────────

interface CompactMediaPreviewProps {
  media: UploadedMedia;
  onRemove: () => void;
}

function CompactMediaPreview({ media, onRemove }: CompactMediaPreviewProps) {
  return (
    <div className="relative bg-card border border-border rounded-[var(--radius)] overflow-hidden group">
      <div className="aspect-[9/16] max-h-[400px] bg-muted-foreground/10 flex items-center justify-center relative">
        {media.type === 'image' ? (
          <img src={media.url} alt="Upload preview" className="w-full h-full object-contain" />
        ) : (
          <video src={media.url} className="w-full h-full object-contain" muted />
        )}

        <div className="absolute top-3 left-3 bg-background/90 rounded-[var(--radius)] px-3 py-1.5 flex items-center gap-2">
          {media.type === 'image' ? <ImageIcon size={16} /> : <Video size={16} />}
          <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)' }}>
            {media.type === 'image' ? 'Image' : 'Video'}
          </span>
        </div>

        <button
          onClick={onRemove}
          className="absolute top-3 right-3 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>

        {media.status === 'analyzing' && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin mb-3 text-primary" size={40} />
            <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>Analyzing...</span>
          </div>
        )}

        {media.status === 'rejected' && (
          <div className="absolute inset-0 bg-destructive/90 flex flex-col items-center justify-center text-destructive-foreground p-6 text-center">
            <AlertCircle size={48} className="mb-3" />
            <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>Content Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AIAnalysisPanel (updated with real data + flag breakdown) ────────────────

interface AIAnalysisPanelProps {
  media: UploadedMedia;
}

const FLAG_LABELS: Record<string, string> = {
  nudity: 'Nudity / Sexual content',
  profanity: 'Profanity / Offensive text',
  violence: 'Violence / Gore',
  illegalItems: 'Drugs / Weapons / Illegal items',
  contactInfo: 'Contact information',
  offTopicContent: 'Off-topic content',
};

function AIAnalysisPanel({ media }: AIAnalysisPanelProps) {
  if (media.status === 'analyzing') {
    return (
      <div className="bg-card border border-border rounded-[var(--radius)] p-8 min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mb-4 text-primary" size={48} />
        <h4 className="mb-2" style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)' }}>
          AI Analysis in Progress
        </h4>
        <p className="text-muted-foreground text-center" style={{ fontSize: '15px', lineHeight: '1.6' }}>
          Our AI is analyzing your content to ensure it meets our guidelines and to identify the best audience for your story.
        </p>
      </div>
    );
  }

  if (media.status === 'error') {
    return (
      <div className="bg-card border border-yellow-500/50 rounded-[var(--radius)] p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-yellow-600" />
          </div>
          <div>
            <h4 className="text-yellow-700 mb-1" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
              Analysis Failed
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              {media.error ?? 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (media.status === 'rejected' && media.aiAnalysis) {
    const flags = media.aiAnalysis.flaggedCategories;
    const triggeredFlags = Object.entries(FLAG_LABELS).filter(([key]) => flags[key as keyof typeof flags]);

    return (
      <div className="bg-card border border-destructive/50 rounded-[var(--radius)] p-8 space-y-6">
        {/* Error Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-destructive" />
          </div>
          <div>
            <h4 className="text-destructive mb-1" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
              Content Not Approved
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              Our AI detected issues with your uploaded content.
            </p>
          </div>
        </div>

        {/* Rejection Reasons */}
        {(media.aiAnalysis.moderationReasons?.length ?? 0) > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-[var(--radius-lg)] p-5">
            <h4 className="text-foreground mb-3" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
              Rejection Reasons:
            </h4>
            <ul className="space-y-2">
              {media.aiAnalysis.moderationReasons!.map((reason, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  <span className="text-destructive mt-1" style={{ fontSize: '18px' }}>•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Flagged Categories */}
        {triggeredFlags.length > 0 && (
          <div className="bg-card border border-border rounded-[var(--radius)] p-5">
            <div className="text-muted-foreground mb-3" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Flagged Categories
            </div>
            <div className="divide-y divide-border">
              {triggeredFlags.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-2.5">
                  <span style={{ fontSize: '14px' }}>{label}</span>
                  <span className="bg-destructive/15 text-destructive rounded-full px-2.5 py-0.5" style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}>
                    Flagged
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-[var(--radius)] p-5">
          <p className="text-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
            Please remove this content and upload a different picture or video that meets our guidelines.
          </p>
        </div>
      </div>
    );
  }

  if (media.status === 'approved' && media.aiAnalysis) {
    const flags = media.aiAnalysis.flaggedCategories;
    const confidencePct = Math.round(media.aiAnalysis.confidence * 100);

    return (
      <div className="bg-card border border-border rounded-[var(--radius)] p-8 space-y-6">
        {/* Success Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-chart-2/20 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} className="text-chart-2" />
          </div>
          <div>
            <h4 className="text-chart-2 mb-1" style={{ fontSize: '20px', fontWeight: 'var(--font-weight-medium)' }}>
              Content Approved
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              Your content passed all our checks and is ready to publish!
            </p>
          </div>
        </div>

        {/* Content Type / Treatment Name */}
        <div>
          <div className="text-muted-foreground mb-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Treatment type detected (shown to customers)
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-[var(--radius)] px-4 py-3">
            <span className="text-primary" style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
              {(() => {
                const name = media.treatmentName || media.aiAnalysis.contentType[0];
                if (!name) return '';
                return media.treatmentId ? `#${media.treatmentId} – ${name}` : name;
              })()}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-muted-foreground mb-2" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI-Generated Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {media.aiAnalysis.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-muted text-foreground px-3 py-2 rounded-[var(--radius)]"
                style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Model Confidence
            </div>
            <span className="text-chart-2" style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
              {confidencePct}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-chart-2 rounded-full transition-all duration-700"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        {/* Moderation Checks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-muted-foreground" />
            <div className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Moderation Checks
            </div>
          </div>
          <div className="bg-card border border-border rounded-[var(--radius)] divide-y divide-border">
            {Object.entries(FLAG_LABELS).map(([key, label]) => {
              const flagged = flags[key as keyof typeof flags];
              return (
                <div key={key} className="flex items-center justify-between px-4 py-2.5">
                  <span style={{ fontSize: '14px' }}>{label}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 ${flagged ? 'bg-destructive/15 text-destructive' : 'bg-chart-2/15 text-chart-2'}`}
                    style={{ fontSize: '11px', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {flagged ? 'Flagged' : 'Clear'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
