import {expect, Page, test} from "@playwright/test";

const USERNAMES = [
    'rammerstorfer.n+test1@gmail.com',
    'rammerstorfer.n+test2@gmail.com',
    'rammerstorfer.n+test3@gmail.com',
    'rammerstorfer.n+test4@gmail.com',
    'rammerstorfer.n+test5@gmail.com',
]
const PASSWORD = 'test123456';

async function login(page: Page, username: string) {
    await page.getByRole('link', {name: `Log in`}).click();

    const emailTextField = page.getByPlaceholder('Enter your email...');
    const passwordTextField = page.getByPlaceholder('Enter your password...');
    const loginButton = page.getByRole('button', {name: 'Log in'});

    await emailTextField.fill(username);
    await passwordTextField.fill(PASSWORD);
    await loginButton.click();

    await page.waitForURL('https://app.todoist.com/app/today');
}

async function openTaskModal(page: Page) {
    const addButton = page.getByRole('button', {name: 'Add task'}).nth(0);
    await addButton.click();
}

async function enterTask(page: Page, title: string) {
    const titleTextField = page.getByRole('textbox', {name: 'Task name'});
    await titleTextField.fill(title);

    const addModalButton = page.getByRole('button', {name: 'Add task'});
    await addModalButton.click();

    const taskItem = page.getByText(title);
    await expect(taskItem).toBeVisible();
}

async function deleteFirstTaskOfCurrentPage(page: Page, title: string) {
    const taskBoundingBox = page.getByTestId('task-list-item');
    await taskBoundingBox.click({button: 'right'});

    const deleteMenuItem = page.getByRole('menuitem', {name: `Delete`});
    await deleteMenuItem.click();

    const deleteModalButton = page.getByRole('button', {name: 'Delete'});
    await deleteModalButton.click();

    const taskItem = page.getByText(title);
    await expect(taskItem).toHaveCount(0);
}

test.beforeEach(async ({page}) => {
    await page.goto('https://www.todoist.com/');
})

test.describe('Add Task', () => {
    test('it should add task (button click - sidebar)', async ({page}) => {
        await login(page, USERNAMES[0]);

        const taskTitle = 'todo1';
        await openTaskModal(page);
        await enterTask(page, taskTitle);
        await deleteFirstTaskOfCurrentPage(page, taskTitle);
    });

    test('it should add task (key press - q)', async ({page}) => {
        await login(page, USERNAMES[1]);

        await page.waitForURL('https://app.todoist.com/app/today');
        await page.keyboard.press('q');

        const taskTitle = 'todo1';
        await enterTask(page, taskTitle);
        await deleteFirstTaskOfCurrentPage(page, taskTitle);
    });
});

test.describe('Remove Task', () => {
    test('it should remove task (right click -> delete)', async ({page}) => {
        await login(page, USERNAMES[2]);

        const taskTitle = 'todo1';
        await openTaskModal(page);
        await enterTask(page, taskTitle);
        await deleteFirstTaskOfCurrentPage(page, taskTitle);
    });
});

test.describe('Edit Task', () => {
    test('it should update task title (right click -> edit)', async ({page}) => {
        const taskTitle1 = 'todo1';
        const taskTitle2 = 'todoUpdated';

        await login(page, USERNAMES[3]);

        await openTaskModal(page);
        await enterTask(page, taskTitle1);

        const taskBoundingBox = page.getByTestId('task-list-item');
        await taskBoundingBox.click({button: 'right'});

        const editMenuItem = page.getByRole('menuitem', {name: `Edit`});
        await editMenuItem.click();

        const titleTextField = page.getByRole('textbox', {name: 'Task name'});
        await titleTextField.fill(taskTitle2);

        const saveButton = page.getByRole('button', {name: 'Save'});
        await saveButton.click();

        const taskItem = page.getByText(taskTitle2);
        await expect(taskItem).toBeVisible();

        await deleteFirstTaskOfCurrentPage(page, taskTitle2);
    });

    test('it should update task title (left click -> modal edit)', async ({page}) => {
        const taskTitle1 = 'todo1';
        const taskTitle2 = 'todoUpdated';

        await login(page, USERNAMES[4]);

        await openTaskModal(page);
        await enterTask(page, taskTitle1);

        const taskBoundingBox = page.getByTestId('task-list-item');
        await taskBoundingBox.click();

        const titleButton = page.getByRole('button', {name: 'Task name'});
        await titleButton.click();
        await titleButton.click();

        const titleTextField = page.getByRole('textbox', {name: 'Task name'});
        await titleTextField.fill(taskTitle2);

        const saveButton = page.getByRole('button', {name: 'Save'});
        await saveButton.click();

        const closeButton = page.getByRole('button', {name: 'Close task'});
        await closeButton.click();

        const taskItem = page.getByText(taskTitle2);
        await expect(taskItem).toBeVisible();

        await deleteFirstTaskOfCurrentPage(page, taskTitle2);
    });
});