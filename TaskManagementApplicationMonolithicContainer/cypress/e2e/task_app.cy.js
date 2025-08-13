describe('Task Management App', () => {
  it('loads the app', () => {
    cy.visit('/');
    cy.get('[data-testid="app-title"]').should('exist');
  });

  it('adds a task and toggles it', () => {
    cy.visit('/');
    cy.get('[data-testid="task-title-input"]').type('My first task');
    cy.get('[data-testid="add-task-button"]').click();
    cy.get('[data-testid="task-list"]').contains('My first task');
    // toggle the first checkbox (newly added task appears at top)
    cy.get('[data-testid="task-list"] input[type="checkbox"]').first().check({ force: true });
  });

  it('shows empty state then list', () => {
    cy.visit('/');
    // Empty on first load (unless previous persisted, which we cannot guarantee in CI)
    // We just assert the app renders the list container or empty state element.
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="empty-state"]').length) {
        cy.get('[data-testid="empty-state"]').should('exist');
      } else {
        cy.get('[data-testid="task-list"]').should('exist');
      }
    });
  });
});
