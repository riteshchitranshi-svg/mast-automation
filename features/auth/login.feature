@login
Feature: Login

  Background:
    Given I am on the login page

  @smoke @TC_LOGIN_001
  Scenario: Successful login with valid credentials
    When I login as "valid_user"
    Then I should be redirected to the home page
    And the navigation bar should be visible

  @negative @TC_LOGIN_002 @TC_LOGIN_003 @TC_LOGIN_004 @TC_LOGIN_005 @TC_LOGIN_006
  Scenario Outline: Login with invalid or empty credentials shows error
    When I login as "<user_key>"
    Then I should see the invalid credentials error
    And I should remain on the login page

    Examples:
      | user_key                |
      | empty_both              |
      | invalid_user            |
      | valid_email_wrong_pass  |
      | valid_email_no_pass     |
      | no_email_valid_pass     |

  @TC_LOGIN_007
  Scenario: Login with Remember Me checkbox checked
    When I login with remember me as "valid_user"
    Then I should be redirected to the home page

  @smoke @TC_LOGIN_012
  Scenario: Successful logout redirects to login with success message
    Given I am logged in as "valid_user"
    When I click the Account button
    And I click Log out
    Then I should be redirected to the login page
    And I should see the signed out success message

  @TC_LOGIN_013
  Scenario: Accessing a protected page when not logged in redirects to login
    When I navigate directly to the cases page
    Then I should be redirected to the login page
