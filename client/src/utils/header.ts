const getPageDisplayName = (page: string) => {
    switch (page) {
      case 'home':
        return 'Home';
      case 'quiz-generator':
        return 'Quiz Generator';
      case 'quizzes':
        return 'Quizzes';
      case 'login':
        return 'Login';
      case 'contact':
        return 'Contact';
      default:
        return page.charAt(0).toUpperCase() + page.slice(1);
    }
  };


export { getPageDisplayName }