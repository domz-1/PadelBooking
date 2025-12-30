
const translations = {
    en: {
        success: 'Operation successful',
        error: 'An error occurred',
        notFound: 'Resource not found',
        unauthorized: 'Unauthorized access',
        forbidden: 'Access forbidden',
        validationError: 'Validation error',
        duplicateError: 'Duplicate entry found',
        loginSuccess: 'Logged in successfully',
        registerSuccess: 'Registered successfully',
        bookingConfirmed: 'Booking confirmed',
        bookingPending: 'Booking pending approval',
        matchJoined: 'Joined match successfully',
        matchFull: 'Match is full',
        offerCreated: 'Offer created successfully',
        storyPosted: 'Story posted successfully',
        profileUpdated: 'Profile updated successfully',
        passwordChanged: 'Password changed successfully',
        emailSent: 'Email sent successfully',
        invalidCredentials: 'Invalid credentials',
        serverError: 'Internal server error'
    },
    ar: {
        success: 'تمت العملية بنجاح',
        error: 'حدث خطأ',
        notFound: 'المورد غير موجود',
        unauthorized: 'دخول غير مصرح به',
        forbidden: 'ممنوع الوصول',
        validationError: 'خطأ في التحقق',
        duplicateError: 'مدخل مكرر',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        registerSuccess: 'تم التسجيل بنجاح',
        bookingConfirmed: 'تم تأكيد الحجز',
        bookingPending: 'الحجز قيد الانتظار',
        matchJoined: 'تم الانضمام للمباراة بنجاح',
        matchFull: 'المباراة ممتلئة',
        offerCreated: 'تم إنشاء العرض بنجاح',
        storyPosted: 'تم نشر القصة بنجاح',
        profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
        passwordChanged: 'تم تغيير كلمة المرور بنجاح',
        emailSent: 'تم إرسال البريد الإلكتروني بنجاح',
        invalidCredentials: 'بيانات الاعتماد غير صالحة',
        serverError: 'خطأ في الخادم الداخلي'
    }
};

const i18n = (req, res, next) => {
    const locale = req.headers['x-locale'] || 'en';
    req.locale = locale === 'ar' ? 'ar' : 'en';

    req.t = (key) => {
        return translations[req.locale][key] || key;
    };

    next();
};

module.exports = i18n;
