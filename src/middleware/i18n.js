const translations = {
    en: {
        success: 'Operation successful',
        error: 'Operation failed',
        notFound: 'Resource not found',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        validationError: 'Validation error'
    },
    ar: {
        success: 'تمت العملية بنجاح',
        error: 'فشلت العملية',
        notFound: 'المورد غير موجود',
        unauthorized: 'غير مصرح',
        forbidden: 'ممنوع',
        validationError: 'خطأ في التحقق'
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
